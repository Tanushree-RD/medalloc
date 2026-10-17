#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "../include/graph.h"

/**
 * Global Graph instance representing the regional hospital network.
 */
static Graph g_graph;
static bool g_graphInitialized = false;

/**
 * Initializes or resets the hospital network graph.
 * Clears vertex array, resets counts to 0, and sets all adjacency list pointers to NULL.
 * 
 * Time Complexity: O(MAX_HOSPITALS)
 */
void initGraph(void) {
    if (g_graphInitialized) {
        freeGraph();
    }

    g_graph.numNodes = 0;
    g_graph.numEdges = 0;

    for (int i = 0; i < MAX_HOSPITALS; i++) {
        g_graph.hospitals[i].hospitalId = 0;
        g_graph.hospitals[i].hospitalName[0] = '\0';
        g_graph.hospitals[i].latitude = 0.0f;
        g_graph.hospitals[i].longitude = 0.0f;
        g_graph.adjList[i] = NULL;
    }

    g_graphInitialized = true;
}

/**
 * Locates the array index of a hospital by its unique ID.
 * 
 * @param id The hospital ID to find
 * @return Index in g_graph.hospitals array, or -1 if not found
 */
int findHospitalIndex(int id) {
    for (int i = 0; i < g_graph.numNodes; i++) {
        if (g_graph.hospitals[i].hospitalId == id) {
            return i;
        }
    }
    return -1;
}

/**
 * Adds a hospital vertex to the graph.
 * 
 * @param id Unique hospital ID
 * @param name Hospital name
 * @param latitude Geographic coordinate
 * @param longitude Geographic coordinate
 */
void addHospital(int id, const char *name, float latitude, float longitude) {
    if (!g_graphInitialized) {
        initGraph();
    }

    if (g_graph.numNodes >= MAX_HOSPITALS) {
        fprintf(stderr, "[Graph Error] Maximum hospital capacity (%d) reached\n", MAX_HOSPITALS);
        return;
    }

    int existingIndex = findHospitalIndex(id);
    if (existingIndex != -1) {
        fprintf(stderr, "[Graph Warning] Hospital ID %d already exists. Updating details.\n", id);
        strncpy(g_graph.hospitals[existingIndex].hospitalName, name, sizeof(g_graph.hospitals[existingIndex].hospitalName) - 1);
        g_graph.hospitals[existingIndex].latitude = latitude;
        g_graph.hospitals[existingIndex].longitude = longitude;
        return;
    }

    int index = g_graph.numNodes;
    g_graph.hospitals[index].hospitalId = id;
    strncpy(g_graph.hospitals[index].hospitalName, name, sizeof(g_graph.hospitals[index].hospitalName) - 1);
    g_graph.hospitals[index].hospitalName[sizeof(g_graph.hospitals[index].hospitalName) - 1] = '\0';
    g_graph.hospitals[index].latitude = latitude;
    g_graph.hospitals[index].longitude = longitude;
    g_graph.adjList[index] = NULL;

    g_graph.numNodes++;
}

/**
 * Helper function to create a new directed EdgeNode.
 */
static EdgeNode* createEdgeNode(int targetId, int distance) {
    EdgeNode *newNode = (EdgeNode *)malloc(sizeof(EdgeNode));
    if (!newNode) {
        fprintf(stderr, "[Graph Error] Memory allocation failed for EdgeNode\n");
        exit(EXIT_FAILURE);
    }
    newNode->targetHospitalId = targetId;
    newNode->distance = distance;
    newNode->next = NULL;
    return newNode;
}

/**
 * Adds an undirected roadway connection between two hospitals.
 * In an adjacency list:
 * - Edge (source -> destination, distance) is prepended to source's list.
 * - Edge (destination -> source, distance) is prepended to destination's list.
 * 
 * This enables bidirectional traversal which Dijkstra will utilize.
 * 
 * @param source Origin hospital ID
 * @param destination Destination hospital ID
 * @param distance Travel distance in kilometers
 */
void addRoad(int source, int destination, int distance) {
    if (!g_graphInitialized) {
        initGraph();
    }

    int srcIndex = findHospitalIndex(source);
    int dstIndex = findHospitalIndex(destination);

    if (srcIndex == -1 || dstIndex == -1) {
        fprintf(stderr, "[Graph Error] Cannot add road: hospital %d or %d not found\n", source, destination);
        return;
    }

    // Add forward edge: source -> destination
    EdgeNode *edge1 = createEdgeNode(destination, distance);
    edge1->next = g_graph.adjList[srcIndex];
    g_graph.adjList[srcIndex] = edge1;

    // Add reverse edge: destination -> source (undirected road)
    EdgeNode *edge2 = createEdgeNode(source, distance);
    edge2->next = g_graph.adjList[dstIndex];
    g_graph.adjList[dstIndex] = edge2;

    g_graph.numEdges++;
}

/**
 * Returns a pointer to the global Graph structure.
 * Allows other algorithms (e.g., Dijkstra's shortest path) to traverse vertices and edges.
 * 
 * @return Pointer to global Graph
 */
Graph *getGraph(void) {
    if (!g_graphInitialized) {
        initGraph();
    }
    return &g_graph;
}

/**
 * Prints the hospital network vertices, coordinates, and adjacency list edges.
 * Outputs to stderr so stdout JSON IPC remains undisturbed.
 */
void printGraph(void) {
    fprintf(stderr, "\n==================== Hospital Network Graph (Adjacency List) ====================\n");
    fprintf(stderr, "Total Hospitals (Nodes): %d | Total Road Connections (Edges): %d\n",
            g_graph.numNodes, g_graph.numEdges);
    fprintf(stderr, "---------------------------------------------------------------------------------\n");

    for (int i = 0; i < g_graph.numNodes; i++) {
        HospitalNode h = g_graph.hospitals[i];
        fprintf(stderr, "[Node %d] #%-2d %-24s (Lat: %.4f, Lon: %.4f)\n",
                i + 1, h.hospitalId, h.hospitalName, h.latitude, h.longitude);

        EdgeNode *curr = g_graph.adjList[i];
        if (curr == NULL) {
            fprintf(stderr, "    └── (No outgoing roads)\n");
        } else {
            while (curr != NULL) {
                int targetIndex = findHospitalIndex(curr->targetHospitalId);
                const char *targetName = (targetIndex != -1) ? g_graph.hospitals[targetIndex].hospitalName : "Unknown";
                fprintf(stderr, "    └── Road -> #%-2d %-22s [Distance: %2d km]\n",
                        curr->targetHospitalId, targetName, curr->distance);
                curr = curr->next;
            }
        }
    }
    fprintf(stderr, "=================================================================================\n\n");
    fflush(stderr);
}

/**
 * Frees all allocated EdgeNodes across all adjacency lists.
 */
void freeGraph(void) {
    if (!g_graphInitialized) {
        return;
    }

    for (int i = 0; i < MAX_HOSPITALS; i++) {
        EdgeNode *curr = g_graph.adjList[i];
        while (curr != NULL) {
            EdgeNode *temp = curr;
            curr = curr->next;
            free(temp);
        }
        g_graph.adjList[i] = NULL;
    }

    g_graph.numNodes = 0;
    g_graph.numEdges = 0;
    g_graphInitialized = false;
}

/**
 * Populates the graph with sample regional hospitals and realistic roadway network distances.
 * Creates 5 hospital nodes and 8 connecting road edges.
 */
void populateSampleHospitalNetwork(void) {
    initGraph();

    // 1. Add 5 Sample Hospitals (Vertices)
    addHospital(1, "City Hospital",           40.7128f, -74.0060f); // Central Hub
    addHospital(2, "General Hospital",        40.7306f, -73.9352f); // North-East
    addHospital(3, "Sunrise Medical Center",  40.7589f, -73.9851f); // Midtown
    addHospital(4, "Apollo Care",             40.7829f, -73.9654f); // Uptown
    addHospital(5, "Metro Hospital",          40.6782f, -73.9442f); // South / Brooklyn

    // 2. Add 8 Weighted Roadway Connections (Edges in km)
    addRoad(1, 2, 5);  // City Hospital <-> General Hospital (5 km)
    addRoad(1, 3, 8);  // City Hospital <-> Sunrise Medical Center (8 km)
    addRoad(1, 5, 12); // City Hospital <-> Metro Hospital (12 km)
    addRoad(2, 3, 6);  // General Hospital <-> Sunrise Medical Center (6 km)
    addRoad(2, 4, 10); // General Hospital <-> Apollo Care (10 km)
    addRoad(3, 4, 4);  // Sunrise Medical Center <-> Apollo Care (4 km)
    addRoad(3, 5, 11); // Sunrise Medical Center <-> Metro Hospital (11 km)
    addRoad(4, 5, 15); // Apollo Care <-> Metro Hospital (15 km)
}
