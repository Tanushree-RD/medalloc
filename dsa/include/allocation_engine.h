#ifndef ALLOCATION_ENGINE_H
#define ALLOCATION_ENGINE_H

#include <stdbool.h>
#include <stddef.h>
#include "priority_queue.h"
#include "hashmap.h"
#include "graph.h"
#include "dijkstra.h"
#include "bipartite_matching.h"

/**
 * @file allocation_engine.h
 * @brief Master Allocation Engine coordinating all DSA modules for MedAlloc
 * 
 * Orchestrates the complete emergency allocation workflow:
 * 1. Priority Queue: Triage ordering (Critical -> High -> Medium -> Low).
 * 2. Hash Map: Fast O(1) resource and inventory lookup.
 * 3. Graph & Dijkstra: Roadway network modeling and shortest path distance computation.
 * 4. Bipartite Matching: Kuhn's augmenting path algorithm for optimal allocation.
 * 5. Dynamic Inventory Updates: Immediate stock deduction upon confirmed matching.
 * 6. Audit Logging: Granular tracking of all algorithmic decisions.
 */

#define MAX_ALLOCATION_RESULTS 128
#define MAX_LOG_MESSAGES 256
#define LOG_LINE_LENGTH 256

/**
 * @struct AllocationResult
 * @brief Final allocation record for an emergency patient request
 */
typedef struct {
    int requestId;
    char patientName[64];
    char assignedHospital[64];
    char allocatedResource[64];
    int distance;
    char priority[32];
    char allocationStatus[32];
    char timestamp[64];
} AllocationResult;

/* Core Allocation Engine APIs */

/**
 * Initializes and resets all coordinating DSA modules:
 * - Priority Queue (Max Heap)
 * - Hash Map (Separate Chaining) & sample inventory
 * - Hospital Network Graph (Adjacency List) & distances
 * - Bipartite Matching (Kuhn's Augmenting Path)
 * - Engine internal state and execution logs
 */
void initializeAllocationEngine(void);

/**
 * Orchestrates the full emergency allocation workflow for a batch of patient requests.
 * 
 * Workflow:
 * 1. Inserts every request into the Priority Queue.
 * 2. While the queue is not empty, dequeues the highest-priority request.
 * 3. Searches available resources using the Hash Map.
 * 4. Runs Dijkstra to find the nearest eligible hospital.
 * 5. Builds a temporary bipartite graph for pending requests.
 * 6. Computes Maximum Bipartite Matching.
 * 7. Allocates the patient to the matched hospital.
 * 8. Updates hospital inventory immediately after allocation.
 * 9. Logs every allocation step.
 * 
 * @param requests Array of incoming patient requests
 * @param count Number of requests in the array
 */
void processRequests(const PatientRequest requests[], int count);

/**
 * Processes a single patient request through the allocation pipeline.
 * 
 * @param request The patient emergency request
 * @return The final AllocationResult
 */
AllocationResult allocateRequest(PatientRequest request);

/**
 * Updates hospital inventory immediately after allocation.
 * Deducts the allocated quantity from the Hash Map inventory.
 * 
 * @param hospitalId Unique hospital ID
 * @param resource Type of medical resource
 * @param quantity Number of units allocated
 * @return true if inventory was successfully decremented, false otherwise
 */
bool updateInventory(int hospitalId, const char *resource, int quantity);

/**
 * Generates a formatted text summary report of all processed allocations.
 * 
 * @param outputBuffer Buffer to receive report string (can be NULL to output to stderr)
 * @param maxLen Maximum buffer size
 */
void generateAllocationReport(char *outputBuffer, size_t maxLen);

/**
 * Prints the complete step-by-step decision log to stderr.
 */
void printAllocationLog(void);

/* Query & Accessor APIs */

int getProcessedRequestCount(void);
int getSuccessfulAllocationCount(void);
int getFailedAllocationCount(void);
const AllocationResult *getAllocationResults(void);
int getAllocationResultCount(void);

#endif /* ALLOCATION_ENGINE_H */
