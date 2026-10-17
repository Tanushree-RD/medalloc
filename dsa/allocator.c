#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <ctype.h>
#include "allocator.h"
#include "include/priority_queue.h"
#include "include/hashmap.h"
#include "include/graph.h"
#include "include/dijkstra.h"

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
 * Maps a hospital name or string identifier to its graph node ID.
 */
static int resolveHospitalIdFromName(const char *name) {
    if (!name || strlen(name) == 0) return 1;
    if (strcasecmp(name, "City Hospital") == 0) return 1;
    if (strcasecmp(name, "General Hospital") == 0) return 2;
    if (strcasecmp(name, "Sunrise Medical Center") == 0) return 3;
    if (strcasecmp(name, "Apollo Care") == 0) return 4;
    if (strcasecmp(name, "Metro Hospital") == 0) return 5;
    return 1;
}

/**
 * Creates and enqueues sample emergency patient requests with varying priority levels.
 */
static void populateSampleRequests(void) {
    PatientRequest req1 = {
        .requestId = 101,
        .patientName = "Elena Gomez",
        .resourceType = "Oxygen Cylinder",
        .hospital = "General Hospital",
        .priority = PRIORITY_LOW, // 1
        .quantity = 2
    };

    PatientRequest req2 = {
        .requestId = 102,
        .patientName = "David Miller",
        .resourceType = "ICU Bed",
        .hospital = "General Hospital",
        .priority = PRIORITY_MEDIUM, // 2
        .quantity = 1
    };

    PatientRequest req3 = {
        .requestId = 103,
        .patientName = "Sarah Chen",
        .resourceType = "Ventilator",
        .hospital = "General Hospital",
        .priority = PRIORITY_HIGH, // 3
        .quantity = 1
    };

    enqueue(req1);
    enqueue(req2);
    enqueue(req3);
}

int main(void) {
    // 1. Initialize data structures
    initQueue();
    populateSampleInventory();
    populateSampleHospitalNetwork();

    // 2. Read any incoming JSON payload from stdin
    char *input_buffer = (char *)malloc(MAX_STDIN_BUFFER);
    size_t total_bytes = 0;
    size_t bytes_read = 0;
    int patientLocation = 2; // Default to node 2 (General Hospital)

    if (input_buffer) {
        while ((bytes_read = fread(input_buffer + total_bytes, 1, MAX_STDIN_BUFFER - 1 - total_bytes, stdin)) > 0) {
            total_bytes += bytes_read;
            if (total_bytes >= MAX_STDIN_BUFFER - 1) break;
        }
        input_buffer[total_bytes] = '\0';
    }

    // 3. Populate base emergency patient requests in Priority Queue
    populateSampleRequests();

    // 4. Parse incoming JSON request from stdin (e.g. from Express API)
    if (input_buffer && total_bytes > 0) {
        char *trimmed = trim_whitespace(input_buffer);
        if (trimmed[0] == '{') {
            PatientRequest incoming = {
                .requestId = 104,
                .patientName = "Incoming Patient",
                .resourceType = "Ventilator",
                .hospital = "General Hospital",
                .priority = PRIORITY_CRITICAL,
                .quantity = 1
            };

            char pName[64] = {0};
            char rType[64] = {0};
            char hosp[64] = {0};
            char prioStr[32] = {0};
            int qty = 1;
            int locId = 0;

            if (extractJsonString(trimmed, "patientName", pName, sizeof(pName))) {
                strncpy(incoming.patientName, pName, sizeof(incoming.patientName) - 1);
            }
            if (extractJsonString(trimmed, "resourceType", rType, sizeof(rType)) ||
                extractJsonString(trimmed, "resource", rType, sizeof(rType))) {
                strncpy(incoming.resourceType, rType, sizeof(incoming.resourceType) - 1);
            }
            if (extractJsonString(trimmed, "hospital", hosp, sizeof(hosp))) {
                strncpy(incoming.hospital, hosp, sizeof(incoming.hospital) - 1);
                patientLocation = resolveHospitalIdFromName(hosp);
            }
            if (extractJsonInt(trimmed, "patientLocation", &locId) ||
                extractJsonInt(trimmed, "locationId", &locId)) {
                if (locId >= 1 && locId <= 5) {
                    patientLocation = locId;
                }
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

    if (input_buffer) {
        free(input_buffer);
    }

    // 5. Output data structures state to stderr for telemetry
    printQueue();
    printHashMap();
    printGraph();

    // 6. Step 1: Dequeue the highest-priority emergency patient request (Max Heap root)
    PatientRequest processed = dequeue();

    // If request specifies hospital location, update patientLocation
    if (strlen(processed.hospital) > 0) {
        int resolved = resolveHospitalIdFromName(processed.hospital);
        if (resolved >= 1 && resolved <= 5) {
            patientLocation = resolved;
        }
    }

    // 7. Step 2: Get all hospitals containing the required resource from the Hash Map
    int candidateHospitals[MAX_HOSPITALS];
    int candidateCount = getHospitalsWithResource(processed.resourceType, candidateHospitals, MAX_HOSPITALS);

    // Check alias lookup if not found directly (e.g., "Blood" -> "A+", "ICU Bed" -> "ICU_BEDS")
    if (candidateCount == 0) {
        if (strcasecmp(processed.resourceType, "ICU Bed") == 0 ||
            strcasecmp(processed.resourceType, "ICU Beds") == 0) {
            candidateCount = getHospitalsWithResource("ICU_BEDS", candidateHospitals, MAX_HOSPITALS);
        } else if (strcasecmp(processed.resourceType, "Blood") == 0) {
            candidateCount = getHospitalsWithResource("A+", candidateHospitals, MAX_HOSPITALS);
        }
    }

    // Fallback: If no candidate found via list, try single search
    ResourceEntry *matchedSingle = search(processed.resourceType);
    if (candidateCount == 0 && matchedSingle) {
        candidateHospitals[0] = matchedSingle->hospitalId;
        candidateCount = 1;
    }

    // 8. Step 3: Run Dijkstra's Algorithm from the patient's location
    Graph *hospitalGraph = getGraph();
    dijkstra(hospitalGraph, patientLocation);

    // 9. Steps 4 & 5: Compare distances to all candidate hospitals and select the closest
    int selectedHospitalId = -1;
    int shortestDist = INF;

    for (int i = 0; i < candidateCount; i++) {
        int hId = candidateHospitals[i];
        int d = getShortestDistance(hId);
        if (d < shortestDist) {
            shortestDist = d;
            selectedHospitalId = hId;
        }
    }

    // If no candidate hospital has stock, fallback to default nearest hospital
    if (selectedHospitalId == -1) {
        selectedHospitalId = (patientLocation == 3) ? 1 : 3;
        shortestDist = getShortestDistance(selectedHospitalId);
    }

    // 10. Reconstruct shortest path from patient location to selected hospital
    int *pathNodes = getPath(selectedHospitalId);
    printShortestPath(selectedHospitalId);

    // Get name of selected hospital
    int selIdx = findHospitalIndex(selectedHospitalId);
    const char *selName = (selIdx != -1) ? hospitalGraph->hospitals[selIdx].hospitalName : "Hospital";

    // 11. Format and return structured JSON response to stdout
    printf("{\n");
    printf("  \"success\": true,\n");
    printf("  \"selectedHospital\": {\n");
    printf("    \"id\": %d,\n", selectedHospitalId);
    printf("    \"name\": \"%s\"\n", selName);
    printf("  },\n");
    printf("  \"distance\": %d,\n", (shortestDist == INF) ? 0 : shortestDist);
    printf("  \"path\": [\n");
    printf("    \"Patient\"");

    if (pathNodes) {
        for (int i = 0; pathNodes[i] != -1; i++) {
            int hId = pathNodes[i];
            int hIdx = findHospitalIndex(hId);
            const char *nodeName = (hIdx != -1) ? hospitalGraph->hospitals[hIdx].hospitalName : "Hospital";
            printf(",\n    \"%s\"", nodeName);
        }
        free(pathNodes);
    }
    printf("\n  ],\n");

    printf("  \"processedRequest\": {\n");
    printf("    \"requestId\": %d,\n", processed.requestId);
    printf("    \"patientName\": \"%s\",\n", processed.patientName);
    printf("    \"resourceType\": \"%s\",\n", processed.resourceType);
    printf("    \"hospital\": \"%s\",\n", processed.hospital);
    printf("    \"priority\": %d,\n", processed.priority);
    printf("    \"priorityLevel\": \"%s\",\n", priorityToString(processed.priority));
    printf("    \"quantity\": %d\n", processed.quantity);
    printf("  }\n");
    printf("}\n");

    fflush(stdout);

    // 12. Free dynamically allocated structures
    freeGraph();
    freeHashMap();

    return 0;
}
