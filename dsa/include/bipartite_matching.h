#ifndef BIPARTITE_MATCHING_H
#define BIPARTITE_MATCHING_H

#include <stdbool.h>

/**
 * @file bipartite_matching.h
 * @brief Maximum Bipartite Matching module using Kuhn's Augmenting Path Algorithm (DFS)
 * 
 * Optimally assigns emergency patient requests (Left Set) to hospitals (Right Set)
 * based on resource availability, capacity constraints, and network proximity.
 * 
 * Time Complexity: O(V * E) where V = |Patients| + |Hospitals|, and E = compatible edges.
 */

#define MAX_PATIENTS 64
#define MAX_MATCH_HOSPITALS 64

/**
 * @struct BipartitePatient
 * @brief Left set vertex representing a patient needing resource allocation
 */
typedef struct {
    int requestId;
    char patientName[64];
    char requiredResource[64];
    int priority;
    int quantity;
} BipartitePatient;

/**
 * @struct BipartiteHospital
 * @brief Right set vertex representing a hospital providing resources
 */
typedef struct {
    int hospitalId;
    char hospitalName[64];
    char availableResources[64];
    int availableQuantity;
} BipartiteHospital;

/**
 * @struct AllocationMatch
 * @brief Result pair linking a patient to an allocated hospital
 */
typedef struct {
    char patientName[64];
    char hospitalName[64];
    char resourceName[64];
    int patientId;
    int hospitalId;
} AllocationMatch;

/* Core Bipartite Matching API */

/**
 * Initializes the bipartite graph, clearing patient and hospital sets and edges.
 */
void initMatching(void);

/**
 * Adds a patient to the Left Set (U).
 * 
 * @param requestId Unique request ID
 * @param patientName Name of patient
 * @param requiredResource Type of resource needed
 * @param priority Triage priority (1 to 4)
 * @param quantity Units required
 */
void addPatient(int requestId, const char *patientName, const char *requiredResource, int priority, int quantity);

/**
 * Adds a hospital with available stock to the Right Set (V).
 * 
 * @param hospitalId Unique hospital ID
 * @param hospitalName Name of medical center
 * @param availableResources Resource type stocked
 * @param availableQuantity Available units in stock
 */
void addHospital(int hospitalId, const char *hospitalName, const char *availableResources, int availableQuantity);

/**
 * Adds a directed edge from patient to hospital indicating resource compatibility and capacity.
 * 
 * @param patientId ID of the patient
 * @param hospitalId ID of the hospital
 */
void addEdge(int patientId, int hospitalId);

/**
 * Searches for an augmenting path using Depth-First Search (Kuhn's Algorithm).
 * 
 * @param patientIdx Index of the patient in the left set
 * @return true if an augmenting path was found and matching augmented, false otherwise
 */
bool findAugmentingPath(int patientIdx);

/**
 * Computes the Maximum Bipartite Matching across all patients and hospitals.
 * 
 * @return Maximum number of patients successfully matched
 */
int maximumMatching(void);

/**
 * Prints the matching assignments to stderr.
 */
void printMatches(void);

/**
 * Retrieves the computed matches for JSON serialization.
 * 
 * @param outMatches Array to receive match pairs
 * @param maxMatches Maximum elements outMatches can receive
 * @return Number of matches written
 */
int getMatches(AllocationMatch outMatches[], int maxMatches);

/**
 * Returns total patient count in the Left Set.
 */
int getPatientCount(void);

/**
 * Returns total hospital count in the Right Set.
 */
int getHospitalCount(void);

#endif /* BIPARTITE_MATCHING_H */
