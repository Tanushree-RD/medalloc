#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "../include/dijkstra.h"

#define MAX_NODES (MAX_HOSPITALS + 1)
#define HEAP_INITIAL_CAPACITY 64

/**
 * Min-Heap element representing (hospitalId, distance)
 */
typedef struct {
    int hospitalId;
    int distance;
} MinHeapNode;

/**
 * Min-Heap Priority Queue for Dijkstra's Algorithm
 */
typedef struct {
    MinHeapNode *data;
    int size;
    int capacity;
} MinHeap;

/* Dijkstra algorithm state variables */
static int g_dist[MAX_NODES];
static bool g_visited[MAX_NODES];
static int g_parent[MAX_NODES];
static int g_currentSource = -1;
static Graph *g_activeGraph = NULL;

/**
 * Swaps two elements in the Min-Heap
 */
static void swapMinHeapNodes(MinHeapNode *a, MinHeapNode *b) {
    MinHeapNode temp = *a;
    *a = *b;
    *b = temp;
}

/**
 * Restores Min-Heap property by sifting up
 */
static void minHeapifyUp(MinHeap *heap, int index) {
    while (index > 0) {
        int parent = (index - 1) / 2;
        if (heap->data[index].distance < heap->data[parent].distance) {
            swapMinHeapNodes(&heap->data[index], &heap->data[parent]);
            index = parent;
        } else {
            break;
        }
    }
}

/**
 * Restores Min-Heap property by sifting down
 */
static void minHeapifyDown(MinHeap *heap, int index) {
    int smallest = index;

    while (1) {
        int left = 2 * index + 1;
        int right = 2 * index + 2;

        if (left < heap->size && heap->data[left].distance < heap->data[smallest].distance) {
            smallest = left;
        }

        if (right < heap->size && heap->data[right].distance < heap->data[smallest].distance) {
            smallest = right;
        }

        if (smallest != index) {
            swapMinHeapNodes(&heap->data[index], &heap->data[smallest]);
            index = smallest;
        } else {
            break;
        }
    }
}

/**
 * Inserts a node into the Min-Heap
 */
static void minHeapInsert(MinHeap *heap, int hospitalId, int distance) {
    if (heap->size >= heap->capacity) {
        heap->capacity *= 2;
        heap->data = (MinHeapNode *)realloc(heap->data, heap->capacity * sizeof(MinHeapNode));
        if (!heap->data) {
            fprintf(stderr, "[Dijkstra Error] Out of memory resizing Min-Heap\n");
            exit(EXIT_FAILURE);
        }
    }

    int idx = heap->size;
    heap->data[idx].hospitalId = hospitalId;
    heap->data[idx].distance = distance;
    heap->size++;

    minHeapifyUp(heap, idx);
}

/**
 * Extracts the node with the minimum distance from the Min-Heap
 */
static MinHeapNode minHeapExtractMin(MinHeap *heap) {
    MinHeapNode root = heap->data[0];
    heap->size--;

    if (heap->size > 0) {
        heap->data[0] = heap->data[heap->size];
        minHeapifyDown(heap, 0);
    }

    return root;
}

/**
 * Runs Dijkstra's Single-Source Shortest Path Algorithm on the hospital network.
 * 
 * Major Steps:
 * 1. Initialize distance array to INF for all vertices; set dist[source] = 0.
 * 2. Initialize visited array to false; set parent array to -1.
 * 3. Push source vertex (source, 0) into Min Priority Queue.
 * 4. While Min-Heap is not empty:
 *    a. Extract vertex u with minimum tentative distance.
 *    b. If u is already visited, discard (lazy deletion).
 *    c. Mark u as visited.
 *    d. For each adjacent hospital v reachable via road (u, v) with weight w:
 *       - Relaxation Step: If !visited[v] and dist[u] + w < dist[v]:
 *         * Update dist[v] = dist[u] + w
 *         * Set parent[v] = u
 *         * Push (v, dist[v]) to Min-Heap
 * 5. Free Min-Heap memory.
 * 
 * Time Complexity: O((V + E) log V)
 * Space Complexity: O(V)
 */
void dijkstra(Graph *graph, int source) {
    if (!graph || graph->numNodes == 0) {
        fprintf(stderr, "[Dijkstra Error] Invalid or empty graph provided\n");
        return;
    }

    g_activeGraph = graph;
    g_currentSource = source;

    // Step 1: Initialize distance, visited, and parent tracking arrays
    for (int i = 0; i < MAX_NODES; i++) {
        g_dist[i] = INF;
        g_visited[i] = false;
        g_parent[i] = -1;
    }

    // Step 2: Set source distance to 0
    g_dist[source] = 0;

    // Step 3: Initialize Min Priority Queue
    MinHeap heap;
    heap.size = 0;
    heap.capacity = HEAP_INITIAL_CAPACITY;
    heap.data = (MinHeapNode *)malloc(heap.capacity * sizeof(MinHeapNode));
    if (!heap.data) {
        fprintf(stderr, "[Dijkstra Error] Failed to allocate Min-Heap\n");
        exit(EXIT_FAILURE);
    }

    // Step 4: Insert source into Min Priority Queue
    minHeapInsert(&heap, source, 0);

    // Step 5: Process vertices by shortest tentative distance
    while (heap.size > 0) {
        MinHeapNode current = minHeapExtractMin(&heap);
        int u = current.hospitalId;

        // Skip if already settled
        if (g_visited[u]) {
            continue;
        }
        g_visited[u] = true;

        // Locate hospital vertex index in the graph
        int uIndex = findHospitalIndex(u);
        if (uIndex == -1) {
            continue;
        }

        // Step 6: Relaxation of adjacent roadway connections
        EdgeNode *edge = graph->adjList[uIndex];
        while (edge != NULL) {
            int v = edge->targetHospitalId;
            int weight = edge->distance;

            // Relaxation condition
            if (!g_visited[v] && g_dist[u] != INF && (g_dist[u] + weight < g_dist[v])) {
                g_dist[v] = g_dist[u] + weight;
                g_parent[v] = u;
                minHeapInsert(&heap, v, g_dist[v]);
            }
            edge = edge->next;
        }
    }

    // Step 7: Clean up heap memory
    free(heap.data);
}

/**
 * Returns shortest road distance in km from source to destination.
 */
int getShortestDistance(int destination) {
    if (destination <= 0 || destination >= MAX_NODES) {
        return INF;
    }
    return g_dist[destination];
}

/**
 * Reconstructs the sequence of hospital IDs from source to destination.
 * 
 * Returns dynamically allocated array of hospital IDs terminated by -1.
 * Caller must free the returned array.
 */
int *getPath(int destination) {
    if (destination <= 0 || destination >= MAX_NODES || g_dist[destination] == INF) {
        int *emptyPath = (int *)malloc(sizeof(int));
        emptyPath[0] = -1;
        return emptyPath;
    }

    // Backtrack from destination to source using parent pointers
    int tempPath[MAX_NODES];
    int count = 0;
    int curr = destination;

    while (curr != -1) {
        tempPath[count++] = curr;
        if (curr == g_currentSource) {
            break;
        }
        curr = g_parent[curr];
    }

    // Allocate result array (+1 for -1 terminator)
    int *path = (int *)malloc((count + 1) * sizeof(int));
    if (!path) {
        fprintf(stderr, "[Dijkstra Error] Memory allocation failed for path\n");
        exit(EXIT_FAILURE);
    }

    // Reverse to establish path: source -> ... -> destination
    for (int i = 0; i < count; i++) {
        path[i] = tempPath[count - 1 - i];
    }
    path[count] = -1; // Terminator

    return path;
}

/**
 * Returns the number of nodes in the path from source to destination.
 */
int getPathLength(int destination) {
    if (destination <= 0 || destination >= MAX_NODES || g_dist[destination] == INF) {
        return 0;
    }

    int count = 0;
    int curr = destination;
    while (curr != -1) {
        count++;
        if (curr == g_currentSource) break;
        curr = g_parent[curr];
    }
    return count;
}

/**
 * Prints the human-readable shortest path and total road distance to stderr.
 */
void printShortestPath(int destination) {
    if (destination <= 0 || destination >= MAX_NODES || g_dist[destination] == INF) {
        fprintf(stderr, "[Dijkstra] No route found from Hospital #%d to Hospital #%d\n",
                g_currentSource, destination);
        return;
    }

    int *path = getPath(destination);
    fprintf(stderr, "\n==================== Shortest Route (Dijkstra) ====================\n");
    fprintf(stderr, "Origin Hospital: #%d | Destination Hospital: #%d\n", g_currentSource, destination);
    fprintf(stderr, "Total Distance: %d km\n", g_dist[destination]);
    fprintf(stderr, "Route: Patient -> ");

    for (int i = 0; path[i] != -1; i++) {
        int hId = path[i];
        int hIdx = findHospitalIndex(hId);
        const char *name = (g_activeGraph && hIdx != -1) ? g_activeGraph->hospitals[hIdx].hospitalName : "Hospital";
        fprintf(stderr, "%s (#%d)%s", name, hId, (path[i + 1] != -1) ? " -> " : "");
    }
    fprintf(stderr, "\n===================================================================\n\n");
    fflush(stderr);

    free(path);
}
