#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "allocator.h"
#include "include/priority_queue.h"

#define MAX_STDIN_BUFFER 65536

/**
 * Trims leading and trailing whitespace characters in-place
 */
static char* trim_whitespace(char *str) {
    char *end;
    while (isspace((unsigned char)*str)) str++;
    if (*str == 0) return str;
    end = str + strlen(str) - 1;
    while (end > str && isspace((unsigned char)*end)) end--;
    end[1] = '\0';
    return str;
}

/**
 * Helper to extract a string value for a given key from simple JSON input.
 * Searches for "key": "value" or "key":"value".
 */
static bool extractJsonString(const char *json, const char *key, char *dest, size_t maxLen) {
    char pattern[128];
    snprintf(pattern, sizeof(pattern), "\"%s\"", key);

    const char *pos = strstr(json, pattern);
    if (!pos) return false;

    pos += strlen(pattern);
    while (*pos == ' ' || *pos == ':' || *pos == '\t') pos++;

    if (*pos == '"') {
        pos++; // Skip opening quote
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
 * Helper to extract an integer value for a given key from simple JSON input.
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
 * Creates and enqueues sample emergency patient requests with varying priority levels.
 */
static void populateSampleRequests(void) {
    PatientRequest req1 = {
        .requestId = 101,
        .patientName = "Elena Gomez",
        .resourceType = "Oxygen Cylinder",
        .hospital = "St. Mary Medical",
        .priority = PRIORITY_LOW, // 1
        .quantity = 2
    };

    PatientRequest req2 = {
        .requestId = 102,
        .patientName = "David Miller",
        .resourceType = "ICU Bed",
        .hospital = "Metro General",
        .priority = PRIORITY_MEDIUM, // 2
        .quantity = 1
    };

    PatientRequest req3 = {
        .requestId = 103,
        .patientName = "Sarah Chen",
        .resourceType = "Ventilator",
        .hospital = "Apex Health",
        .priority = PRIORITY_HIGH, // 3
        .quantity = 1
    };

    enqueue(req1);
    enqueue(req2);
    enqueue(req3);
}

int main(void) {
    // 1. Initialize the Priority Queue (Max Heap)
    initQueue();

    // 2. Read any incoming JSON from stdin
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

    // 3. Populate base sample requests
    populateSampleRequests();

    // 4. If an external request was submitted via stdin, parse and enqueue it
    if (input_buffer && total_bytes > 0) {
        char *trimmed = trim_whitespace(input_buffer);
        if (trimmed[0] == '{') {
            PatientRequest incoming = {
                .requestId = 104,
                .patientName = "Incoming Patient",
                .resourceType = "General Resource",
                .hospital = "City Emergency Hub",
                .priority = PRIORITY_CRITICAL,
                .quantity = 1
            };

            char pName[64] = {0};
            char rType[64] = {0};
            char hosp[64] = {0};
            char prioStr[32] = {0};
            int qty = 1;

            if (extractJsonString(trimmed, "patientName", pName, sizeof(pName))) {
                strncpy(incoming.patientName, pName, sizeof(incoming.patientName) - 1);
            }
            if (extractJsonString(trimmed, "resourceType", rType, sizeof(rType)) ||
                extractJsonString(trimmed, "resource", rType, sizeof(rType))) {
                strncpy(incoming.resourceType, rType, sizeof(incoming.resourceType) - 1);
            }
            if (extractJsonString(trimmed, "hospital", hosp, sizeof(hosp))) {
                strncpy(incoming.hospital, hosp, sizeof(incoming.hospital) - 1);
            }
            if (extractJsonString(trimmed, "priority", prioStr, sizeof(prioStr))) {
                incoming.priority = stringToPriority(prioStr);
            }
            if (extractJsonInt(trimmed, "quantity", &qty)) {
                incoming.quantity = qty;
            }

            enqueue(incoming);
        }
    }

    // Free the stdin buffer
    if (input_buffer) {
        free(input_buffer);
    }

    // 5. Print the priority queue state (outputs to stderr for monitoring/logging)
    printQueue();

    // 6. Remove (dequeue) the highest priority request from the Max Heap
    PatientRequest processed = dequeue();

    // 7. Output structured JSON response to stdout
    printf("{\n");
    printf("  \"success\": true,\n");
    printf("  \"processedRequest\": {\n");
    printf("    \"requestId\": %d,\n", processed.requestId);
    printf("    \"patientName\": \"%s\",\n", processed.patientName);
    printf("    \"resourceType\": \"%s\",\n", processed.resourceType);
    printf("    \"hospital\": \"%s\",\n", processed.hospital);
    printf("    \"priority\": %d,\n", processed.priority);
    printf("    \"priorityLevel\": \"%s\",\n", priorityToString(processed.priority));
    printf("    \"quantity\": %d\n", processed.quantity);
    printf("  },\n");
    printf("  \"remainingRequests\": %d\n", size());
    printf("}\n");

    fflush(stdout);

    return 0;
}
