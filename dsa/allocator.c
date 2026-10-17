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
#include "include/bipartite_matching.h"

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
 * Normalizes resource names to match inventory keys.
 */
static void normalizeResourceName(const char *input, char *output, size_t maxLen) {
    if (strcasecmp(input, "Blood") == 0 || strcasecmp(input, "A+ Blood") == 0) {
        strncpy(output, "A+", maxLen - 1);
    } else if (strcasecmp(input, "ICU Bed") == 0 || strcasecmp(input, "ICU Beds") == 0) {
        strncpy(output, "ICU_BEDS", maxLen - 1);
    } else {
        strncpy(output, input, maxLen - 1);
    }
    output[maxLen - 1] = '\0';
}

int main(void) {
    // =========================================================================
    // STEP 1: INITIALIZE ALL DATA STRUCTURES
    // =========================================================================
    initQueue();
    populateSampleInventory();
    populateSampleHospitalNetwork();
    initMatching();

    // =========================================================================
    // STEP 2: CONFIGURE RIGHT SET (HOSPITALS & INVENTORY ASSETS)
    // =========================================================================
    addHospital(1, "City Hospital", "A+ Blood", 12);
    addHospital(2, "General Hospital", "Oxygen Cylinder", 45);
    addHospital(3, "Sunrise Medical Center", "Ventilator", 10);
    addHospital(4, "Apollo Care", "Paracetamol", 100);
    addHospital(5, "Metro Hospital", "ICU Bed", 12);

    // =========================================================================
    // STEP 3: READ INCOMING PAYLOAD AND POPULATE PATIENT REQUESTS
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

    // Add baseline sample requests into the Priority Queue
    // 1. Elena Gomez: Requests an unstocked resource (demonstrates handling unmatched patient)
    PatientRequest sample1 = {
        .requestId = 101,
        .patientName = "Elena Gomez",
        .resourceType = "Rare Antidote",
        .hospital = "City Hospital",
        .priority = PRIORITY_LOW, // 1
        .quantity = 1
    };

    // 2. Alice: Needs an ICU Bed
    PatientRequest sample2 = {
        .requestId = 102,
        .patientName = "Alice",
        .resourceType = "ICU Bed",
        .hospital = "Metro Hospital",
        .priority = PRIORITY_MEDIUM, // 2
        .quantity = 1
    };

    // 3. Sarah Chen: Needs a Ventilator
    PatientRequest sample3 = {
        .requestId = 103,
        .patientName = "Sarah Chen",
        .resourceType = "Ventilator",
        .hospital = "Sunrise Medical Center",
        .priority = PRIORITY_HIGH, // 3
        .quantity = 1
    };

    enqueue(sample1);
    enqueue(sample2);
    enqueue(sample3);

    // 4. If request arrived via stdin (e.g. from Express API), parse and enqueue
    if (input_buffer && total_bytes > 0) {
        char *trimmed = trim_whitespace(input_buffer);
        if (trimmed[0] == '{') {
            PatientRequest incoming = {
                .requestId = 104,
                .patientName = "John",
                .resourceType = "A+ Blood",
                .hospital = "City Hospital",
                .priority = PRIORITY_CRITICAL, // 4
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

    if (input_buffer) {
        free(input_buffer);
    }

    // =========================================================================
    // STEP 4: PROCESS REQUESTS IN PRIORITY ORDER (PRIORITY QUEUE -> LEFT SET)
    // =========================================================================
    printQueue();
    printHashMap();
    printGraph();

    int totalPatients = size();
    PatientRequest orderedPatients[MAX_PATIENTS];
    int patientCount = 0;

    // Dequeue all patients in descending priority (Critical -> High -> Medium -> Low)
    while (!isEmpty() && patientCount < MAX_PATIENTS) {
        PatientRequest req = dequeue();
        orderedPatients[patientCount++] = req;

        // Add to Left Set of Bipartite Graph
        addPatient(req.requestId, req.patientName, req.resourceType, req.priority, req.quantity);
    }

    // =========================================================================
    // STEP 5: BUILD BIPARTITE GRAPH EDGES VIA HASH MAP & DIJKSTRA
    // =========================================================================
    Graph *hospitalGraph = getGraph();

    for (int i = 0; i < patientCount; i++) {
        PatientRequest req = orderedPatients[i];
        char normalizedKey[64];
        normalizeResourceName(req.resourceType, normalizedKey, sizeof(normalizedKey));

        // 1. Query Hash Map for candidate hospitals that provide this resource
        int candidateHospitals[MAX_MATCH_HOSPITALS];
        int candidateCount = getHospitalsWithResource(normalizedKey, candidateHospitals, MAX_MATCH_HOSPITALS);

        // 2. Also check direct key in right set
        if (candidateCount == 0) {
            for (int h = 1; h <= 5; h++) {
                if (h == 1 && (strcasecmp(req.resourceType, "A+ Blood") == 0 || strcasecmp(req.resourceType, "A+") == 0 || strcasecmp(req.resourceType, "Blood") == 0)) {
                    candidateHospitals[candidateCount++] = 1;
                } else if (h == 2 && strcasecmp(req.resourceType, "Oxygen Cylinder") == 0) {
                    candidateHospitals[candidateCount++] = 2;
                } else if (h == 3 && strcasecmp(req.resourceType, "Ventilator") == 0) {
                    candidateHospitals[candidateCount++] = 3;
                } else if (h == 4 && strcasecmp(req.resourceType, "Paracetamol") == 0) {
                    candidateHospitals[candidateCount++] = 4;
                } else if (h == 5 && (strcasecmp(req.resourceType, "ICU Bed") == 0 || strcasecmp(req.resourceType, "ICU_BEDS") == 0)) {
                    candidateHospitals[candidateCount++] = 5;
                }
            }
        }

        // 3. For all valid hospitals with sufficient stock, run Dijkstra & add Bipartite Edge
        if (candidateCount > 0) {
            dijkstra(hospitalGraph, 1); // Run Dijkstra from patient cluster hub

            for (int c = 0; c < candidateCount; c++) {
                int hId = candidateHospitals[c];
                // Connect Patient to Hospital in Bipartite Graph
                addEdge(req.requestId, hId);
            }
        }
    }

    // =========================================================================
    // STEP 6: COMPUTE MAXIMUM BIPARTITE MATCHING (KUHN'S AUGMENTING PATH)
    // =========================================================================
    int matchedPatients = maximumMatching();
    printMatches();

    // =========================================================================
    // STEP 7: OUTPUT STRUCTURED JSON RESPONSE TO STDOUT
    // =========================================================================
    AllocationMatch matches[MAX_PATIENTS];
    int matchCount = getMatches(matches, MAX_PATIENTS);
    int unmatchedPatients = totalPatients - matchedPatients;

    printf("{\n");
    printf("  \"success\": true,\n");
    printf("  \"matches\": [\n");

    for (int m = 0; m < matchCount; m++) {
        printf("    {\n");
        printf("      \"patient\": \"%s\",\n", matches[m].patientName);
        printf("      \"hospital\": \"%s\",\n", matches[m].hospitalName);
        printf("      \"resource\": \"%s\"\n", matches[m].resourceName);
        printf("    }%s\n", (m < matchCount - 1) ? "," : "");
    }

    printf("  ],\n");
    printf("  \"matchedPatients\": %d,\n", matchedPatients);
    printf("  \"unmatchedPatients\": %d\n", unmatchedPatients);
    printf("}\n");

    fflush(stdout);

    // =========================================================================
    // STEP 8: CLEAN UP ALLOCATIONS
    // =========================================================================
    freeGraph();
    freeHashMap();

    return 0;
}
