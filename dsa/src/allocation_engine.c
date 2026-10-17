#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <time.h>
#include <stdarg.h>
#include "../include/allocation_engine.h"

/**
 * ============================================================================
 * MEDALLOC MASTER ALLOCATION ENGINE
 * ============================================================================
 * 
 * Orchestrates the full emergency allocation workflow by coordinating 5
 * independent DSA modules without duplicating algorithm logic:
 * 
 * 1. Priority Queue (Max Heap) -> Orders incoming requests by triage level.
 * 2. Hash Map (Separate Chaining) -> O(1) inventory and facility lookup.
 * 3. Network Graph (Adjacency List) -> Geographic representation of hospital hubs.
 * 4. Dijkstra's Algorithm (Min Heap) -> Computes shortest travel road distances.
 * 5. Bipartite Matching (Kuhn's Algorithm) -> Optimally pairs patients with facilities.
 * 
 * Dynamic Updates:
 * - Following a confirmed allocation, the hospital inventory is decremented
 *   immediately in the Hash Map to ensure subsequent triage decisions use live stock.
 * - Every step (triage, candidate search, pathfinding, matching, inventory update)
 *   is recorded in an internal audit log with timestamps.
 */

/* Internal Engine State */
static AllocationResult g_results[MAX_ALLOCATION_RESULTS];
static int g_resultCount = 0;
static int g_processedCount = 0;
static int g_successfulCount = 0;
static int g_failedCount = 0;

static char g_logs[MAX_LOG_MESSAGES][LOG_LINE_LENGTH];
static int g_logCount = 0;
static bool g_engineInitialized = false;

/**
 * Generates an ISO-8601 or formatted timestamp string.
 */
static void getCurrentTimestamp(char *buffer, size_t maxLen) {
    time_t now = time(NULL);
    struct tm *tm_info = localtime(&now);
    if (tm_info) {
        strftime(buffer, maxLen, "%Y-%m-%d %H:%M:%S", tm_info);
    } else {
        strncpy(buffer, "2026-10-17 09:30:00", maxLen - 1);
        buffer[maxLen - 1] = '\0';
    }
}

/**
 * Records an execution message in the internal engine audit log.
 */
static void appendLog(const char *format, ...) {
    char timeStr[64];
    getCurrentTimestamp(timeStr, sizeof(timeStr));

    char message[LOG_LINE_LENGTH];
    va_list args;
    va_start(args, format);
    vsnprintf(message, sizeof(message), format, args);
    va_end(args);

    if (g_logCount < MAX_LOG_MESSAGES) {
        snprintf(g_logs[g_logCount], sizeof(g_logs[g_logCount]), "[%s] %s", timeStr, message);
        g_logCount++;
    }

    // Also mirror to stderr for real-time observability
    fprintf(stderr, "[Engine %s] %s\n", timeStr, message);
    fflush(stderr);
}

/**
 * Resolves a hospital's display name from its ID using the Graph module.
 */
static const char *resolveHospitalName(int hospitalId) {
    Graph *g = getGraph();
    if (g) {
        int idx = findHospitalIndex(hospitalId);
        if (idx >= 0 && idx < g->numNodes) {
            return g->hospitals[idx].hospitalName;
        }
    }

    switch (hospitalId) {
        case 1: return "City Hospital";
        case 2: return "General Hospital";
        case 3: return "Sunrise Medical Center";
        case 4: return "Apollo Care";
        case 5: return "Metro Hospital";
        default: return "Unknown Facility";
    }
}

/**
 * Resolves patient origin hospital node ID from request location.
 */
static int resolvePatientOrigin(const PatientRequest *req) {
    if (!req) return 1;

    // Check if hospital string matches a known facility
    if (strlen(req->hospital) > 0) {
        if (strcasecmp(req->hospital, "City Hospital") == 0 || strcmp(req->hospital, "1") == 0) return 1;
        if (strcasecmp(req->hospital, "General Hospital") == 0 || strcmp(req->hospital, "2") == 0) return 2;
        if (strcasecmp(req->hospital, "Sunrise Medical Center") == 0 || strcmp(req->hospital, "3") == 0) return 3;
        if (strcasecmp(req->hospital, "Apollo Care") == 0 || strcmp(req->hospital, "4") == 0) return 4;
        if (strcasecmp(req->hospital, "Metro Hospital") == 0 || strcmp(req->hospital, "5") == 0) return 5;
    }

    // Default to node 1 (City Hospital - central urban hub)
    return 1;
}

/**
 * Normalizes resource names to match inventory search keys.
 */
static void normalizeKey(const char *input, char *output, size_t maxLen) {
    if (strcasecmp(input, "Blood") == 0 || strcasecmp(input, "A+ Blood") == 0) {
        strncpy(output, "A+", maxLen - 1);
    } else if (strcasecmp(input, "ICU Bed") == 0 || strcasecmp(input, "ICU Beds") == 0) {
        strncpy(output, "ICU_BEDS", maxLen - 1);
    } else {
        strncpy(output, input, maxLen - 1);
    }
    output[maxLen - 1] = '\0';
}

/**
 * Initializes (or resets) the entire allocation engine and underlying DSA modules.
 */
void initializeAllocationEngine(void) {
    initQueue();
    populateSampleInventory();
    populateSampleHospitalNetwork();
    initMatching();

    g_resultCount = 0;
    g_processedCount = 0;
    g_successfulCount = 0;
    g_failedCount = 0;
    g_logCount = 0;
    g_engineInitialized = true;

    appendLog("Allocation Engine initialized: Priority Queue, Hash Map, Graph, Dijkstra & Bipartite Matching ready.");
}

/**
 * Updates hospital inventory immediately after allocation.
 * Deducts the allocated quantity from the Hash Map inventory.
 */
bool updateInventory(int hospitalId, const char *resource, int quantity) {
    char norm[64];
    normalizeKey(resource, norm, sizeof(norm));

    bool success = deductHospitalResourceStock(resource, hospitalId, quantity);
    if (!success) {
        success = deductHospitalResourceStock(norm, hospitalId, quantity);
    }

    if (success) {
        int remaining = getHospitalResourceStock(norm, hospitalId);
        appendLog("[Inventory Update] Hospital #%d (%s): Deducted %d unit(s) of '%s'. Remaining stock: %d",
                  hospitalId, resolveHospitalName(hospitalId), quantity, resource, remaining);
    } else {
        appendLog("[Inventory Error] Hospital #%d (%s): Failed to deduct %d unit(s) of '%s'.",
                  hospitalId, resolveHospitalName(hospitalId), quantity, resource);
    }

    return success;
}

/**
 * Allocates a single emergency request through the coordinated algorithm pipeline.
 */
AllocationResult allocateRequest(PatientRequest req) {
    if (!g_engineInitialized) {
        initializeAllocationEngine();
    }

    AllocationResult res;
    memset(&res, 0, sizeof(res));

    res.requestId = req.requestId;
    strncpy(res.patientName, req.patientName, sizeof(res.patientName) - 1);
    strncpy(res.allocatedResource, req.resourceType, sizeof(res.allocatedResource) - 1);
    strncpy(res.priority, priorityToString(req.priority), sizeof(res.priority) - 1);
    getCurrentTimestamp(res.timestamp, sizeof(res.timestamp));

    appendLog("[Triage Process] Processing Request #%d for '%s' (Resource: '%s', Priority: %s, Qty: %d)",
              req.requestId, req.patientName, req.resourceType, res.priority, req.quantity);

    // =========================================================================
    // STEP 1: Search available resources using Hash Map
    // =========================================================================
    char normKey[64];
    normalizeKey(req.resourceType, normKey, sizeof(normKey));

    int candidateHospitalIds[MAX_HOSPITALS];
    int candidateCount = getHospitalsWithResource(normKey, candidateHospitalIds, MAX_HOSPITALS);

    // Also check direct resource key if normalized key returned no candidates
    if (candidateCount == 0 && strcasecmp(normKey, req.resourceType) != 0) {
        candidateCount = getHospitalsWithResource(req.resourceType, candidateHospitalIds, MAX_HOSPITALS);
    }

    // Filter candidate hospitals to only those having sufficient available stock
    int eligibleHospitals[MAX_HOSPITALS];
    int eligibleCount = 0;

    for (int i = 0; i < candidateCount; i++) {
        int hId = candidateHospitalIds[i];
        int stock = getHospitalResourceStock(normKey, hId);
        if (stock == 0) {
            stock = getHospitalResourceStock(req.resourceType, hId);
        }

        if (stock >= req.quantity) {
            eligibleHospitals[eligibleCount++] = hId;
        }
    }

    appendLog("[Hash Map Search] Resource '%s' found at %d facility(ies) with sufficient stock (>= %d units).",
              req.resourceType, eligibleCount, req.quantity);

    // Handle case where no eligible hospital exists
    if (eligibleCount == 0) {
        strncpy(res.assignedHospital, "None", sizeof(res.assignedHospital) - 1);
        res.distance = 0;
        strncpy(res.allocationStatus, "Failed", sizeof(res.allocationStatus) - 1);
        g_failedCount++;

        appendLog("[Allocation FAILED] No eligible hospital has '%s' with sufficient stock for patient '%s'.",
                  req.resourceType, req.patientName);
        return res;
    }

    // =========================================================================
    // STEP 2: Find nearest eligible hospitals using Dijkstra
    // =========================================================================
    int originNode = resolvePatientOrigin(&req);
    Graph *graph = getGraph();
    dijkstra(graph, originNode);

    // Sort eligible hospitals by shortest distance from patient origin (nearest first)
    for (int i = 0; i < eligibleCount - 1; i++) {
        for (int j = i + 1; j < eligibleCount; j++) {
            int distI = getShortestDistance(eligibleHospitals[i]);
            int distJ = getShortestDistance(eligibleHospitals[j]);
            if (distJ < distI) {
                int temp = eligibleHospitals[i];
                eligibleHospitals[i] = eligibleHospitals[j];
                eligibleHospitals[j] = temp;
            }
        }
    }

    int nearestDist = getShortestDistance(eligibleHospitals[0]);
    appendLog("[Dijkstra Routing] Origin: Hospital #%d (%s). Nearest eligible facility: '%s' (%d km).",
              originNode, resolveHospitalName(originNode), resolveHospitalName(eligibleHospitals[0]), nearestDist);

    // =========================================================================
    // STEP 3: Build temporary Bipartite Graph for pending request
    // =========================================================================
    initMatching();

    // Left Set: Patient
    addPatient(req.requestId, req.patientName, req.resourceType, req.priority, req.quantity);

    // Right Set: Eligible Hospitals (ordered by proximity)
    for (int i = 0; i < eligibleCount; i++) {
        int hId = eligibleHospitals[i];
        int stock = getHospitalResourceStock(normKey, hId);
        if (stock == 0) {
            stock = getHospitalResourceStock(req.resourceType, hId);
        }

        addHospital(hId, resolveHospitalName(hId), req.resourceType, stock);
        addEdge(req.requestId, hId);
    }

    appendLog("[Bipartite Model] Created bipartite graph with 1 Patient and %d eligible Hospital edge(s).", eligibleCount);

    // =========================================================================
    // STEP 4: Compute Maximum Bipartite Matching (Kuhn's Augmenting Path)
    // =========================================================================
    int matchedCount = maximumMatching();

    if (matchedCount > 0) {
        AllocationMatch matchPairs[1];
        getMatches(matchPairs, 1);

        int matchedHospitalId = matchPairs[0].hospitalId;
        strncpy(res.assignedHospital, matchPairs[0].hospitalName, sizeof(res.assignedHospital) - 1);
        res.distance = getShortestDistance(matchedHospitalId);
        strncpy(res.allocationStatus, "Allocated", sizeof(res.allocationStatus) - 1);
        g_successfulCount++;

        appendLog("[Bipartite Match] Augmenting path found: '%s' -> '%s' (Distance: %d km).",
                  req.patientName, res.assignedHospital, res.distance);

        // =====================================================================
        // STEP 5: Update hospital inventory immediately after allocation
        // =====================================================================
        updateInventory(matchedHospitalId, req.resourceType, req.quantity);
    } else {
        strncpy(res.assignedHospital, "None", sizeof(res.assignedHospital) - 1);
        res.distance = 0;
        strncpy(res.allocationStatus, "Failed", sizeof(res.allocationStatus) - 1);
        g_failedCount++;

        appendLog("[Bipartite Failed] No augmenting path could be established for '%s'.", req.patientName);
    }

    return res;
}

/**
 * Orchestrates the full emergency allocation workflow for a batch of requests.
 */
void processRequests(const PatientRequest requests[], int count) {
    initializeAllocationEngine();

    appendLog("====================================================================");
    appendLog("STARTING EMERGENCY ALLOCATION BATCH: %d REQUEST(S)", count);
    appendLog("====================================================================");

    // Step 1 & 2: Insert every incoming request into the Priority Queue
    for (int i = 0; i < count; i++) {
        enqueue(requests[i]);
    }

    appendLog("[Priority Queue] Enqueued %d emergency requests into Max Heap.", count);

    // Step 3: While the queue is not empty, process in descending priority order
    while (!isEmpty()) {
        PatientRequest req = dequeue();
        g_processedCount++;

        AllocationResult result = allocateRequest(req);

        if (g_resultCount < MAX_ALLOCATION_RESULTS) {
            g_results[g_resultCount++] = result;
        }
    }

    appendLog("====================================================================");
    appendLog("BATCH COMPLETE: Processed: %d | Successful: %d | Failed: %d",
              g_processedCount, g_successfulCount, g_failedCount);
    appendLog("====================================================================");

    printAllocationLog();
}

/**
 * Generates a formatted text summary report.
 */
void generateAllocationReport(char *outputBuffer, size_t maxLen) {
    char report[4096];
    int offset = 0;

    offset += snprintf(report + offset, sizeof(report) - offset,
                       "\n==================== MedAlloc Allocation Report ====================\n"
                       "Processed Requests:     %d\n"
                       "Successful Allocations: %d\n"
                       "Failed Allocations:     %d\n"
                       "--------------------------------------------------------------------\n"
                       "%-4s | %-16s | %-10s | %-16s | %-22s | %-8s | %-10s\n"
                       "--------------------------------------------------------------------\n",
                       g_processedCount, g_successfulCount, g_failedCount,
                       "ID", "Patient", "Priority", "Resource", "Assigned Hospital", "Dist(km)", "Status");

    for (int i = 0; i < g_resultCount; i++) {
        offset += snprintf(report + offset, sizeof(report) - offset,
                           "#%-3d | %-16s | %-10s | %-16s | %-22s | %-8d | %-10s\n",
                           g_results[i].requestId,
                           g_results[i].patientName,
                           g_results[i].priority,
                           g_results[i].allocatedResource,
                           g_results[i].assignedHospital,
                           g_results[i].distance,
                           g_results[i].allocationStatus);
        if ((size_t)offset >= sizeof(report) - 128) break;
    }

    offset += snprintf(report + offset, sizeof(report) - offset,
                       "====================================================================\n\n");

    if (outputBuffer && maxLen > 0) {
        strncpy(outputBuffer, report, maxLen - 1);
        outputBuffer[maxLen - 1] = '\0';
    } else {
        fprintf(stderr, "%s", report);
        fflush(stderr);
    }
}

/**
 * Prints the step-by-step decision log to stderr.
 */
void printAllocationLog(void) {
    fprintf(stderr, "\n==================== Step-by-Step Decision Log ====================\n");
    for (int i = 0; i < g_logCount; i++) {
        fprintf(stderr, "%s\n", g_logs[i]);
    }
    fprintf(stderr, "===================================================================\n\n");
    fflush(stderr);
}

/* Query & Accessor APIs */

int getProcessedRequestCount(void) {
    return g_processedCount;
}

int getSuccessfulAllocationCount(void) {
    return g_successfulCount;
}

int getFailedAllocationCount(void) {
    return g_failedCount;
}

const AllocationResult *getAllocationResults(void) {
    return g_results;
}

int getAllocationResultCount(void) {
    return g_resultCount;
}
