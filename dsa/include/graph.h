#ifndef GRAPH_H
#define GRAPH_H

#include <stdbool.h>

/**
 * @file graph.h
 * @brief Hospital Network Graph using Adjacency List Representation
 * 
 * Represents hospitals as vertices and connecting roadways as weighted edges.
 * Edge weights represent travel distance in kilometers (km).
 * Designed for modular reuse by Dijkstra's shortest-path algorithm.
 */

#define MAX_HOSPITALS 64

/**
 * @struct HospitalNode
 * @brief Represents a hospital vertex in the network
 */
typedef struct {
    int hospitalId;
    char hospitalName[64];
    float latitude;
    float longitude;
} HospitalNode;

/**
 * @struct EdgeNode
 * @brief Adjacency list node representing a weighted roadway connection
 */
typedef struct EdgeNode {
    int targetHospitalId;       /* ID of connected destination hospital */
    int distance;               /* Road travel distance in kilometers */
    struct EdgeNode *next;      /* Next adjacent edge in adjacency list */
} EdgeNode;

/**
 * @struct Graph
 * @brief Network graph containing vertices and adjacency lists
 */
typedef struct {
    HospitalNode hospitals[MAX_HOSPITALS];
    EdgeNode *adjList[MAX_HOSPITALS];
    int numNodes;               /* Total hospital vertices */
    int numEdges;               /* Total unique roadway connections */
} Graph;

/* Public API Functions */

/**
 * Initializes (or clears) the hospital network graph.
 */
void initGraph(void);

/**
 * Adds a hospital vertex to the graph.
 * 
 * @param id Unique integer identifier
 * @param name Name of medical center
 * @param latitude Geographic coordinate
 * @param longitude Geographic coordinate
 */
void addHospital(int id, const char *name, float latitude, float longitude);

/**
 * Adds an undirected roadway edge between two hospitals with a given distance in km.
 * 
 * @param source Hospital ID of origin
 * @param destination Hospital ID of destination
 * @param distance Road distance in kilometers
 */
void addRoad(int source, int destination, int distance);

/**
 * Prints the hospital network and adjacency list connections to stderr.
 */
void printGraph(void);

/**
 * Returns a pointer to the global Graph instance.
 * 
 * @return Pointer to global Graph
 */
Graph *getGraph(void);

/**
 * Frees all dynamically allocated edge nodes in the adjacency lists.
 */
void freeGraph(void);

/**
 * Populates the graph with sample regional hospitals and roadway distances.
 */
void populateSampleHospitalNetwork(void);

/**
 * Helper to find hospital index in internal arrays by hospital ID.
 * 
 * @param id Hospital ID to search
 * @return Array index in range [0, numNodes - 1], or -1 if not found
 */
int findHospitalIndex(int id);

#endif /* GRAPH_H */
