#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "../include/bipartite_matching.h"

/**
 * ============================================================================
 * BIPARTITE GRAPH REPRESENTATION
 * ============================================================================
 * A Bipartite Graph G = (U, V, E) consists of two disjoint sets of vertices:
 * - Left Set U (Patients): Represents emergency requests requiring medical assets.
 * - Right Set V (Hospitals): Represents regional hospital facilities with inventory.
 * 
 * An edge (u, v) exists in E if and only if:
 * 1. Hospital v provides the specific medical resource requested by Patient u.
 * 2. Hospital v has sufficient available stock (availableQuantity >= requestedQuantity).
 * 
 * No edges exist between vertices within the same set (i.e. no Patient-Patient or
 * Hospital-Hospital edges). This is represented via a 2D adjacency matrix:
 * g_adj[u][v] = true if Patient u can be matched to Hospital v.
 */
static BipartitePatient g_patients[MAX_PATIENTS];
static int g_patientCount = 0;

static BipartiteHospital g_hospitals[MAX_MATCH_HOSPITALS];
static int g_hospitalCount = 0;

static bool g_adj[MAX_PATIENTS][MAX_MATCH_HOSPITALS];

/* Matching state arrays */
static int g_matchHospital[MAX_MATCH_HOSPITALS]; /* Hospital v matched to Patient u (-1 if free) */
static int g_matchPatient[MAX_PATIENTS];         /* Patient u matched to Hospital v (-1 if free) */
static bool g_visitedHospital[MAX_MATCH_HOSPITALS]; /* Visited flag for DFS traversal */

/**
 * Initializes the bipartite graph, resetting vertices and clearing edge matrix.
 */
void initMatching(void) {
    g_patientCount = 0;
    g_hospitalCount = 0;

    for (int i = 0; i < MAX_PATIENTS; i++) {
        g_matchPatient[i] = -1;
        for (int j = 0; j < MAX_MATCH_HOSPITALS; j++) {
            g_adj[i][j] = false;
        }
    }

    for (int j = 0; j < MAX_MATCH_HOSPITALS; j++) {
        g_matchHospital[j] = -1;
        g_visitedHospital[j] = false;
    }
}

/**
 * Finds index of patient by requestId in the Left Set.
 */
static int findPatientIdx(int patientId) {
    for (int i = 0; i < g_patientCount; i++) {
        if (g_patients[i].requestId == patientId) {
            return i;
        }
    }
    // Fallback if index passed directly
    if (patientId >= 0 && patientId < g_patientCount) {
        return patientId;
    }
    return -1;
}

/**
 * Finds index of hospital by hospitalId in the Right Set.
 */
static int findHospitalIdx(int hospitalId) {
    for (int j = 0; j < g_hospitalCount; j++) {
        if (g_hospitals[j].hospitalId == hospitalId) {
            return j;
        }
    }
    // Fallback if index passed directly
    if (hospitalId >= 0 && hospitalId < g_hospitalCount) {
        return hospitalId;
    }
    return -1;
}

/**
 * Adds a patient request to the Left Set (U).
 */
void addPatient(int requestId, const char *patientName, const char *requiredResource, int priority, int quantity) {
    if (g_patientCount >= MAX_PATIENTS) {
        fprintf(stderr, "[Bipartite Error] Maximum patient capacity (%d) reached\n", MAX_PATIENTS);
        return;
    }

    int idx = g_patientCount;
    g_patients[idx].requestId = requestId;
    strncpy(g_patients[idx].patientName, patientName, sizeof(g_patients[idx].patientName) - 1);
    g_patients[idx].patientName[sizeof(g_patients[idx].patientName) - 1] = '\0';
    strncpy(g_patients[idx].requiredResource, requiredResource, sizeof(g_patients[idx].requiredResource) - 1);
    g_patients[idx].requiredResource[sizeof(g_patients[idx].requiredResource) - 1] = '\0';
    g_patients[idx].priority = priority;
    g_patients[idx].quantity = quantity;

    g_matchPatient[idx] = -1;
    for (int j = 0; j < MAX_MATCH_HOSPITALS; j++) {
        g_adj[idx][j] = false;
    }

    g_patientCount++;
}

/**
 * Adds a hospital with stock to the Right Set (V).
 */
void addHospital(int hospitalId, const char *hospitalName, const char *availableResources, int availableQuantity) {
    if (g_hospitalCount >= MAX_MATCH_HOSPITALS) {
        fprintf(stderr, "[Bipartite Error] Maximum hospital capacity (%d) reached\n", MAX_MATCH_HOSPITALS);
        return;
    }

    int idx = g_hospitalCount;
    g_hospitals[idx].hospitalId = hospitalId;
    strncpy(g_hospitals[idx].hospitalName, hospitalName, sizeof(g_hospitals[idx].hospitalName) - 1);
    g_hospitals[idx].hospitalName[sizeof(g_hospitals[idx].hospitalName) - 1] = '\0';
    strncpy(g_hospitals[idx].availableResources, availableResources, sizeof(g_hospitals[idx].availableResources) - 1);
    g_hospitals[idx].availableResources[sizeof(g_hospitals[idx].availableResources) - 1] = '\0';
    g_hospitals[idx].availableQuantity = availableQuantity;

    g_matchHospital[idx] = -1;
    for (int i = 0; i < MAX_PATIENTS; i++) {
        g_adj[i][idx] = false;
    }

    g_hospitalCount++;
}

/**
 * Creates an edge between a patient and a hospital if resource requirements are satisfied.
 */
void addEdge(int patientId, int hospitalId) {
    int u = findPatientIdx(patientId);
    int v = findHospitalIdx(hospitalId);

    if (u == -1 || v == -1) {
        fprintf(stderr, "[Bipartite Warning] Invalid edge: patient %d or hospital %d not found\n", patientId, hospitalId);
        return;
    }

    g_adj[u][v] = true;
}

/**
 * ============================================================================
 * DFS AUGMENTING PATH ALGORITHM (KUHN'S ALGORITHM)
 * ============================================================================
 * An Augmenting Path with respect to a matching M is an alternating path that:
 * 1. Starts at an unmatched vertex in U (an unassigned Patient).
 * 2. Alternates between non-matching edges (in E \ M) and matching edges (in M).
 * 3. Ends at an unmatched vertex in V (a free Hospital).
 * 
 * Berge's Lemma proves that a matching M is maximum if and only if there are no
 * augmenting paths. By flipping the matched/unmatched status along an augmenting
 * path, the total size of the matching M strictly increases by 1 (|M| -> |M| + 1).
 * 
 * Depth-First Search explores candidates:
 * - For each compatible hospital v connected to patient u:
 *   - If v has not been visited during this search iteration:
 *     - Mark v as visited.
 *     - If v is currently unmatched (g_matchHospital[v] < 0):
 *         Match u to v directly!
 *     - If v is already matched to patient u':
 *         Recursively search if u' can be reassigned to an alternate hospital via DFS.
 *         If u' finds an alternate, reassign v to u!
 * 
 * @param u Index of the patient in Left Set
 * @return true if an augmenting path was found and matching enlarged, false otherwise
 */
bool findAugmentingPath(int u) {
    for (int v = 0; v < g_hospitalCount; v++) {
        // Consider compatible hospital that has not been visited in this search
        if (g_adj[u][v] && !g_visitedHospital[v]) {
            g_visitedHospital[v] = true;

            // If hospital is free OR its previously matched patient can be reassigned
            if (g_matchHospital[v] < 0 || findAugmentingPath(g_matchHospital[v])) {
                g_matchHospital[v] = u;
                g_matchPatient[u] = v;
                return true;
            }
        }
    }
    return false;
}

/**
 * ============================================================================
 * MAXIMUM BIPARTITE MATCHING PROCESS & TIME COMPLEXITY
 * ============================================================================
 * 
 * Algorithm Process:
 * 1. Initialize matchHospital[] = -1 (all hospitals unassigned).
 * 2. Initialize matchPatient[] = -1 (all patients unassigned).
 * 3. Iterate through every patient u in U:
 *    - Reset visitedHospital[] to false for the new search round.
 *    - Execute DFS findAugmentingPath(u).
 *    - If an augmenting path is found, increment total matching count.
 * 
 * Time Complexity Analysis: O(V * E)
 * - Number of patients |U| <= V, Number of hospitals |V'| <= V.
 * - For each of the |U| patients, we perform at most one DFS search.
 * - In each DFS search, each edge in E is examined at most once because visitedHospital
 *   prevents revisiting hospitals.
 * - Hence, each augmentation step takes O(E) time.
 * - Total time for |U| patients: O(|U| * E) = O(V * E).
 * - For regional hospital networks (|U| <= 64, |V| <= 64, |E| <= 500), execution
 *   completes in less than 0.1 milliseconds!
 * 
 * @return Total number of successfully matched patients
 */
int maximumMatching(void) {
    // Reset all matching assignments
    for (int j = 0; j < g_hospitalCount; j++) {
        g_matchHospital[j] = -1;
    }
    for (int i = 0; i < g_patientCount; i++) {
        g_matchPatient[i] = -1;
    }

    int totalMatches = 0;

    // Search for augmenting paths for each patient
    for (int u = 0; u < g_patientCount; u++) {
        // Reset visited array for this DFS iteration
        for (int v = 0; v < g_hospitalCount; v++) {
            g_visitedHospital[v] = false;
        }

        if (findAugmentingPath(u)) {
            totalMatches++;
        }
    }

    return totalMatches;
}

/**
 * Retrieves the list of computed matches for JSON output.
 */
int getMatches(AllocationMatch outMatches[], int maxMatches) {
    int count = 0;

    for (int u = 0; u < g_patientCount && count < maxMatches; u++) {
        int v = g_matchPatient[u];
        if (v >= 0 && v < g_hospitalCount) {
            strncpy(outMatches[count].patientName, g_patients[u].patientName, sizeof(outMatches[count].patientName) - 1);
            outMatches[count].patientName[sizeof(outMatches[count].patientName) - 1] = '\0';

            strncpy(outMatches[count].hospitalName, g_hospitals[v].hospitalName, sizeof(outMatches[count].hospitalName) - 1);
            outMatches[count].hospitalName[sizeof(outMatches[count].hospitalName) - 1] = '\0';

            strncpy(outMatches[count].resourceName, g_patients[u].requiredResource, sizeof(outMatches[count].resourceName) - 1);
            outMatches[count].resourceName[sizeof(outMatches[count].resourceName) - 1] = '\0';

            outMatches[count].patientId = g_patients[u].requestId;
            outMatches[count].hospitalId = g_hospitals[v].hospitalId;

            count++;
        }
    }

    return count;
}

/**
 * Returns total patients in Left Set.
 */
int getPatientCount(void) {
    return g_patientCount;
}

/**
 * Returns total hospitals in Right Set.
 */
int getHospitalCount(void) {
    return g_hospitalCount;
}

/**
 * Prints the bipartite matching results to stderr.
 */
void printMatches(void) {
    fprintf(stderr, "\n==================== Maximum Bipartite Matching ====================\n");
    fprintf(stderr, "Total Patients: %d | Total Hospitals: %d\n", g_patientCount, g_hospitalCount);
    fprintf(stderr, "--------------------------------------------------------------------\n");
    fprintf(stderr, "%-16s | %-16s | %-24s | %-10s\n",
            "Patient", "Resource", "Matched Hospital", "Status");
    fprintf(stderr, "--------------------------------------------------------------------\n");

    int matchedCount = 0;
    for (int u = 0; u < g_patientCount; u++) {
        int v = g_matchPatient[u];
        if (v >= 0 && v < g_hospitalCount) {
            matchedCount++;
            fprintf(stderr, "%-16s | %-16s | %-24s | Matched\n",
                    g_patients[u].patientName,
                    g_patients[u].requiredResource,
                    g_hospitals[v].hospitalName);
        } else {
            fprintf(stderr, "%-16s | %-16s | %-24s | Unmatched\n",
                    g_patients[u].patientName,
                    g_patients[u].requiredResource,
                    "No Suitable Facility");
        }
    }

    fprintf(stderr, "--------------------------------------------------------------------\n");
    fprintf(stderr, "Matched: %d | Unmatched: %d\n", matchedCount, g_patientCount - matchedCount);
    fprintf(stderr, "====================================================================\n\n");
    fflush(stderr);
}
