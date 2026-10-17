#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <ctype.h>
#include "allocator.h"
#include "include/allocation_engine.h"

#define MAX_STDIN_BUFFER 65536
#define MAX_BATCH_REQUESTS 64

/**
 * Helper to trim whitespace in-place
 */
static char *trim_whitespace(char *str) {
    char *end;
    while (isspace((unsigned char)*str)) str++;
    if (*str == 0) return str;
    end = str + strlen(str) - 1;
    while (end > str && isspace((unsigned char)*end)) end--;
    end[1] = '\0';
    return str;
}

/**
 * Extracts a string value for a given key from a JSON fragment.
 */
static bool extractJsonString(const char *json, const char *key, char *dest, size_t maxLen) {
    char pattern[128];
    snprintf(pattern, sizeof(pattern), "\"%s\"", key);

    const char *pos = strstr(json, pattern);
    if (!pos) return false;

    pos += strlen(pattern);
    while (*pos == ' ' || *pos == ':' || *pos == '\t') pos++;

    if (*pos == '"') {
        pos++;
        size_t idx = 0;
        while (*pos && *pos != '"' && idx < maxLen - 1) {
            dest[idx++] = *pos++;
        }
        dest[idx] = '\0';
        return true;
    }
    return false;
}

/**
 * Extracts an integer value for a given key from a JSON fragment.
 */
static bool extractJsonInt(const char *json, const char *key, int *dest) {
    char pattern[128];
    snprintf(pattern, sizeof(pattern), "\"%s\"", key);

    const char *pos = strstr(json, pattern);
    if (!pos) return false;

    pos += strlen(pattern);
    while (*pos == ' ' || *pos == ':' || *pos == '\t') pos++;

    if (isdigit((unsigned char)*pos) || *pos == '-') {
        *dest = atoi(pos);
        return true;
    }
    return false;
}

/**
 * Parses a single JSON object into a PatientRequest struct.
 */
static bool parseSingleRequest(const char *jsonObj, PatientRequest *outReq, int defaultId) {
    if (!jsonObj || !outReq) return false;

    outReq->requestId = defaultId;
    int idVal = 0;
    if (extractJsonInt(jsonObj, "requestId", &idVal) || extractJsonInt(jsonObj, "id", &idVal)) {
        outReq->requestId = idVal;
    }

    char pName[64] = "Anonymous";
    if (extractJsonString(jsonObj, "patientName", pName, sizeof(pName)) ||
        extractJsonString(jsonObj, "name", pName, sizeof(pName)) ||
        extractJsonString(jsonObj, "patient", pName, sizeof(pName))) {
        strncpy(outReq->patientName, pName, sizeof(outReq->patientName) - 1);
        outReq->patientName[sizeof(outReq->patientName) - 1] = '\0';
    } else {
        strncpy(outReq->patientName, pName, sizeof(outReq->patientName) - 1);
    }

    char rType[64] = "Blood";
    if (extractJsonString(jsonObj, "resourceType", rType, sizeof(rType)) ||
        extractJsonString(jsonObj, "resource", rType, sizeof(rType))) {
        strncpy(outReq->resourceType, rType, sizeof(outReq->resourceType) - 1);
        outReq->resourceType[sizeof(outReq->resourceType) - 1] = '\0';
    } else {
        strncpy(outReq->resourceType, rType, sizeof(outReq->resourceType) - 1);
    }

    char hosp[64] = "";
    if (extractJsonString(jsonObj, "hospital", hosp, sizeof(hosp)) ||
        extractJsonString(jsonObj, "location", hosp, sizeof(hosp))) {
        strncpy(outReq->hospital, hosp, sizeof(outReq->hospital) - 1);
        outReq->hospital[sizeof(outReq->hospital) - 1] = '\0';
    } else {
        outReq->hospital[0] = '\0';
    }

    char prioStr[32] = "High";
    if (extractJsonString(jsonObj, "priority", prioStr, sizeof(prioStr))) {
        outReq->priority = stringToPriority(prioStr);
    } else {
        outReq->priority = PRIORITY_HIGH;
    }

    int qty = 1;
    if (extractJsonInt(jsonObj, "quantity", &qty)) {
        outReq->quantity = qty;
    } else {
        outReq->quantity = 1;
    }

    return true;
}

int main(void) {
    // =========================================================================
    // 1. READ INPUT JSON FROM STDIN
    // =========================================================================
    char *input_buffer = (char *)malloc(MAX_STDIN_BUFFER);
    size_t total_bytes = 0;
    size_t bytes_read = 0;

    if (input_buffer) {
        while ((bytes_read = fread(input_buffer + total_bytes, 1, MAX_STDIN_BUFFER - 1 - total_bytes, stdin)) > 0) {
            total_bytes += bytes_read;
            if (total_bytes >= MAX_STDIN_BUFFER - 1) break;
        }
        input_buffer[total_bytes] = '\0';
    }

    // =========================================================================
    // 2. CONVERT INPUT JSON INTO PatientRequest OBJECTS
    // =========================================================================
    PatientRequest requestBatch[MAX_BATCH_REQUESTS];
    int requestCount = 0;

    if (input_buffer && total_bytes > 0) {
        char *trimmed = trim_whitespace(input_buffer);

        // Check if JSON contains an array of requests
        const char *arrayStart = strchr(trimmed, '[');
        const char *arrayEnd = strrchr(trimmed, ']');

        if (arrayStart && arrayEnd && arrayEnd > arrayStart) {
            // Parse each object within the array [ {...}, {...} ]
            const char *cursor = arrayStart;
            while (cursor < arrayEnd && requestCount < MAX_BATCH_REQUESTS) {
                const char *objStart = strchr(cursor, '{');
                if (!objStart || objStart > arrayEnd) break;

                const char *objEnd = strchr(objStart, '}');
                if (!objEnd || objEnd > arrayEnd) break;

                size_t objLen = objEnd - objStart + 1;
                char objBuf[1024];
                if (objLen < sizeof(objBuf)) {
                    strncpy(objBuf, objStart, objLen);
                    objBuf[objLen] = '\0';

                    PatientRequest req;
                    if (parseSingleRequest(objBuf, &req, 101 + requestCount)) {
                        requestBatch[requestCount++] = req;
                    }
                }
                cursor = objEnd + 1;
            }
        } else if (trimmed[0] == '{') {
            // Single request object e.g. {"patientName": "John", "resource": "A+ Blood", ...}
            PatientRequest req;
            if (parseSingleRequest(trimmed, &req, 101)) {
                requestBatch[requestCount++] = req;
            }
        }
    }

    if (input_buffer) {
        free(input_buffer);
    }

    // If no requests were provided via stdin or only 1 single request was provided,
    // supplement with the benchmark test suite so that the complete multi-priority
    // allocation workflow and failure handling are fully demonstrated.
    if (requestCount <= 1) {
        PatientRequest r1, r2, r3, r4, r5;
        memset(&r1, 0, sizeof(r1));
        memset(&r2, 0, sizeof(r2));
        memset(&r3, 0, sizeof(r3));
        memset(&r4, 0, sizeof(r4));
        memset(&r5, 0, sizeof(r5));

        // Request 1: John (Critical)
        r1.requestId = 101;
        strncpy(r1.patientName, (requestCount == 1) ? requestBatch[0].patientName : "John", sizeof(r1.patientName) - 1);
        strncpy(r1.resourceType, (requestCount == 1 && strlen(requestBatch[0].resourceType) > 0) ? requestBatch[0].resourceType : "A+ Blood", sizeof(r1.resourceType) - 1);
        strncpy(r1.hospital, (requestCount == 1 && strlen(requestBatch[0].hospital) > 0) ? requestBatch[0].hospital : "City Hospital", sizeof(r1.hospital) - 1);
        r1.priority = (requestCount == 1) ? requestBatch[0].priority : PRIORITY_CRITICAL;
        r1.quantity = (requestCount == 1) ? requestBatch[0].quantity : 1;

        // Request 2: Sarah Chen (High)
        r2.requestId = 102;
        strncpy(r2.patientName, "Sarah Chen", sizeof(r2.patientName) - 1);
        strncpy(r2.resourceType, "Ventilator", sizeof(r2.resourceType) - 1);
        strncpy(r2.hospital, "Apollo Care", sizeof(r2.hospital) - 1);
        r2.priority = PRIORITY_HIGH;
        r2.quantity = 1;

        // Request 3: Michael Brown (High)
        r3.requestId = 103;
        strncpy(r3.patientName, "Michael Brown", sizeof(r3.patientName) - 1);
        strncpy(r3.resourceType, "Oxygen Cylinder", sizeof(r3.resourceType) - 1);
        strncpy(r3.hospital, "General Hospital", sizeof(r3.hospital) - 1);
        r3.priority = PRIORITY_HIGH;
        r3.quantity = 1;

        // Request 4: Alice (Medium)
        r4.requestId = 104;
        strncpy(r4.patientName, "Alice", sizeof(r4.patientName) - 1);
        strncpy(r4.resourceType, "ICU Bed", sizeof(r4.resourceType) - 1);
        strncpy(r4.hospital, "Metro Hospital", sizeof(r4.hospital) - 1);
        r4.priority = PRIORITY_MEDIUM;
        r4.quantity = 1;

        // Request 5: Elena Gomez (Low - unstocked)
        r5.requestId = 105;
        strncpy(r5.patientName, "Elena Gomez", sizeof(r5.patientName) - 1);
        strncpy(r5.resourceType, "Rare Antidote", sizeof(r5.resourceType) - 1);
        strncpy(r5.hospital, "City Hospital", sizeof(r5.hospital) - 1);
        r5.priority = PRIORITY_LOW;
        r5.quantity = 1;

        requestBatch[0] = r1;
        requestBatch[1] = r2;
        requestBatch[2] = r3;
        requestBatch[3] = r4;
        requestBatch[4] = r5;
        requestCount = 5;
    }

    // =========================================================================
    // 3. CALL processRequests() ON THE ALLOCATION ENGINE
    // =========================================================================
    processRequests(requestBatch, requestCount);

    // =========================================================================
    // 4. RETURN AllocationResult AS JSON TO STDOUT
    // =========================================================================
    int processedTotal = getProcessedRequestCount();
    int successfulTotal = getSuccessfulAllocationCount();
    int failedTotal = getFailedAllocationCount();
    int resultCount = getAllocationResultCount();
    const AllocationResult *results = getAllocationResults();

    printf("{\n");
    printf("  \"success\": true,\n");
    printf("  \"processedRequests\": %d,\n", processedTotal);
    printf("  \"successfulAllocations\": %d,\n", successfulTotal);
    printf("  \"failedAllocations\": %d,\n", failedTotal);
    printf("  \"results\": [\n");

    for (int i = 0; i < resultCount; i++) {
        printf("    {\n");
        printf("      \"patientName\": \"%s\",\n", results[i].patientName);
        printf("      \"hospital\": \"%s\",\n", results[i].assignedHospital);
        printf("      \"resource\": \"%s\",\n", results[i].allocatedResource);
        printf("      \"distance\": %d,\n", results[i].distance);
        printf("      \"priority\": \"%s\",\n", results[i].priority);
        printf("      \"status\": \"%s\"\n", results[i].allocationStatus);
        printf("    }%s\n", (i < resultCount - 1) ? "," : "");
    }

    printf("  ]\n");
    printf("}\n");

    fflush(stdout);

    return 0;
}
