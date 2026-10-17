#ifndef DIJKSTRA_H
#define DIJKSTRA_H

#include <stdbool.h>
#include "graph.h"

/**
 * @file dijkstra.h
 * @brief Dijkstra's Shortest Path Algorithm for Emergency Healthcare Routing
 * 
 * Computes single-source shortest paths on the hospital network graph using a Min-Heap
 * Priority Queue, distance array, visited array, and parent tracking array.
 */

#define INF 1000000000

/* Core Dijkstra Functions */

/**
 * Runs Dijkstra's Algorithm from a designated source hospital node.
 * Populates distance array, visited flags, and parent pointers.
 * 
 * Time Complexity: O((V + E) log V) using Min-Heap
 * 
 * @param graph Pointer to the hospital network graph
 * @param source Origin hospital ID (1-based ID)
 */
void dijkstra(Graph *graph, int source);

/**
 * Retrieves the computed shortest road distance from source to destination in kilometers.
 * 
 * @param destination Destination hospital ID
 * @return Shortest distance in km, or INF if unreachable
 */
int getShortestDistance(int destination);

/**
 * Prints the reconstructed shortest path and total distance to stderr.
 * 
 * @param destination Destination hospital ID
 */
void printShortestPath(int destination);

/**
 * Reconstructs the shortest path from source to destination as an array of hospital IDs.
 * The returned array is dynamically allocated and terminated with -1.
 * Caller is responsible for freeing the returned pointer.
 * 
 * @param destination Destination hospital ID
 * @return Dynamically allocated int array of hospital IDs terminated with -1
 */
int *getPath(int destination);

/**
 * Returns the number of hospital nodes in the reconstructed path.
 * 
 * @param destination Destination hospital ID
 * @return Path node count, or 0 if unreachable
 */
int getPathLength(int destination);

#endif /* DIJKSTRA_H */
