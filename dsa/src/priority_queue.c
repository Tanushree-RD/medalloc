#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include "../include/priority_queue.h"

#define INITIAL_CAPACITY 64

/**
 * Internal Priority Queue structure representing the Max Heap
 */
typedef struct {
    PatientRequest *data;
    int count;
    int capacity;
} PriorityQueue;

static PriorityQueue g_queue = { NULL, 0, 0 };

/**
 * Compares two patient requests for Max-Heap ordering.
 * Returns > 0 if request 'a' has higher priority than request 'b'.
 * If priorities are equal, the request with the lower requestId (FIFO arrival) has precedence.
 */
static int compareRequests(const PatientRequest *a, const PatientRequest *b) {
    if (a->priority != b->priority) {
        return a->priority - b->priority;
    }
    // Tie-breaker: earlier request ID gets higher precedence
    return b->requestId - a->requestId;
}

/**
 * Swaps two elements in the heap
 */
static void swap(PatientRequest *a, PatientRequest *b) {
    PatientRequest temp = *a;
    *a = *b;
    *b = temp;
}

/**
 * Restores the Max-Heap invariant by moving an element upwards.
 * Called after insertion at the bottom of the heap.
 * 
 * @param index The index of the element to bubble up
 */
static void heapifyUp(int index) {
    while (index > 0) {
        int parentIndex = (index - 1) / 2;
        if (compareRequests(&g_queue.data[index], &g_queue.data[parentIndex]) > 0) {
            swap(&g_queue.data[index], &g_queue.data[parentIndex]);
            index = parentIndex;
        } else {
            break;
        }
    }
}

/**
 * Restores the Max-Heap invariant by moving an element downwards.
 * Called after replacing root with the last element during dequeue.
 * 
 * @param index The index of the element to sift down
 */
static void heapifyDown(int index) {
    int largest = index;

    while (1) {
        int leftChild = 2 * index + 1;
        int rightChild = 2 * index + 2;

        if (leftChild < g_queue.count &&
            compareRequests(&g_queue.data[leftChild], &g_queue.data[largest]) > 0) {
            largest = leftChild;
        }

        if (rightChild < g_queue.count &&
            compareRequests(&g_queue.data[rightChild], &g_queue.data[largest]) > 0) {
            largest = rightChild;
        }

        if (largest != index) {
            swap(&g_queue.data[index], &g_queue.data[largest]);
            index = largest;
        } else {
            break;
        }
    }
}

/**
 * Ensures the internal dynamic array has sufficient capacity.
 */
static void ensureCapacity(void) {
    if (g_queue.count >= g_queue.capacity) {
        int newCapacity = (g_queue.capacity == 0) ? INITIAL_CAPACITY : g_queue.capacity * 2;
        PatientRequest *newData = (PatientRequest *)realloc(g_queue.data, newCapacity * sizeof(PatientRequest));
        if (!newData) {
            fprintf(stderr, "[PriorityQueue Error] Out of memory allocating %d elements\n", newCapacity);
            exit(EXIT_FAILURE);
        }
        g_queue.data = newData;
        g_queue.capacity = newCapacity;
    }
}

/**
 * Initializes or resets the global Priority Queue.
 * Allocates initial storage and resets size to 0.
 */
void initQueue(void) {
    if (g_queue.data != NULL) {
        free(g_queue.data);
        g_queue.data = NULL;
    }
    g_queue.count = 0;
    g_queue.capacity = INITIAL_CAPACITY;
    g_queue.data = (PatientRequest *)malloc(g_queue.capacity * sizeof(PatientRequest));
    if (!g_queue.data) {
        fprintf(stderr, "[PriorityQueue Error] Failed to initialize queue memory\n");
        exit(EXIT_FAILURE);
    }
}

/**
 * Inserts a patient request into the Max Heap.
 * The request is placed at the end and heapified up to its proper rank.
 * 
 * @param request The patient request to insert
 */
void enqueue(PatientRequest request) {
    if (g_queue.data == NULL) {
        initQueue();
    }
    ensureCapacity();

    int insertIndex = g_queue.count;
    g_queue.data[insertIndex] = request;
    g_queue.count++;

    heapifyUp(insertIndex);
}

/**
 * Removes and returns the highest priority patient request (root of Max Heap).
 * Replaces root with the last element and restores heap order via heapifyDown.
 * 
 * @return The highest priority PatientRequest
 */
PatientRequest dequeue(void) {
    if (isEmpty()) {
        fprintf(stderr, "[PriorityQueue Warning] Dequeue called on empty queue\n");
        PatientRequest empty = { 0, "", "", "", 0, 0 };
        return empty;
    }

    PatientRequest topRequest = g_queue.data[0];

    // Replace root with the last item in the heap
    g_queue.count--;
    if (g_queue.count > 0) {
        g_queue.data[0] = g_queue.data[g_queue.count];
        heapifyDown(0);
    }

    return topRequest;
}

/**
 * Returns the highest priority patient request without removing it.
 * 
 * @return PatientRequest at top of heap
 */
PatientRequest peek(void) {
    if (isEmpty()) {
        PatientRequest empty = { 0, "", "", "", 0, 0 };
        return empty;
    }
    return g_queue.data[0];
}

/**
 * Checks if the priority queue is empty.
 * 
 * @return true if queue has 0 elements, false otherwise
 */
bool isEmpty(void) {
    return (g_queue.count == 0);
}

/**
 * Returns current size (count of elements) in the queue.
 * 
 * @return Number of elements currently enqueued
 */
int size(void) {
    return g_queue.count;
}

/**
 * Helper to convert numerical priority to human-readable string.
 */
const char* priorityToString(int priority) {
    switch (priority) {
        case PRIORITY_CRITICAL: return "Critical";
        case PRIORITY_HIGH:     return "High";
        case PRIORITY_MEDIUM:   return "Medium";
        case PRIORITY_LOW:      return "Low";
        default:                return "Unknown";
    }
}

/**
 * Helper to parse string representation to numeric priority level.
 */
int stringToPriority(const char *str) {
    if (!str || strlen(str) == 0) return PRIORITY_MEDIUM;
    if (strcasecmp(str, "Critical") == 0 || strcmp(str, "4") == 0) return PRIORITY_CRITICAL;
    if (strcasecmp(str, "High") == 0     || strcmp(str, "3") == 0) return PRIORITY_HIGH;
    if (strcasecmp(str, "Medium") == 0   || strcmp(str, "2") == 0) return PRIORITY_MEDIUM;
    if (strcasecmp(str, "Low") == 0      || strcmp(str, "1") == 0) return PRIORITY_LOW;
    return PRIORITY_MEDIUM;
}

/**
 * Prints the current state of the priority queue.
 * Outputs to stderr so as not to corrupt JSON communication on stdout.
 */
void printQueue(void) {
    fprintf(stderr, "\n==================== Priority Queue (Max Heap) ====================\n");
    fprintf(stderr, "Total Requests in Queue: %d\n", g_queue.count);
    fprintf(stderr, "-------------------------------------------------------------------\n");
    fprintf(stderr, "%-6s | %-16s | %-10s | %-14s | %-14s | %-5s\n",
            "ReqID", "Patient Name", "Priority", "Resource", "Hospital", "Qty");
    fprintf(stderr, "-------------------------------------------------------------------\n");

    for (int i = 0; i < g_queue.count; i++) {
        PatientRequest req = g_queue.data[i];
        fprintf(stderr, "#%-5d | %-16s | %-10s | %-14s | %-14s | %-5d\n",
                req.requestId,
                req.patientName,
                priorityToString(req.priority),
                req.resourceType,
                req.hospital,
                req.quantity);
    }
    fprintf(stderr, "===================================================================\n\n");
    fflush(stderr);
}
