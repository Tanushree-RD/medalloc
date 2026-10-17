#ifndef PRIORITY_QUEUE_H
#define PRIORITY_QUEUE_H

#include <stdbool.h>

/**
 * @file priority_queue.h
 * @brief Max-Heap Priority Queue for MedAlloc Emergency Resource Allocation
 * 
 * Orders incoming patient requests by urgency (Critical = 4 down to Low = 1)
 * so that the most critical emergencies are always allocated resources first.
 */

/* Defined priority levels */
#define PRIORITY_CRITICAL 4
#define PRIORITY_HIGH     3
#define PRIORITY_MEDIUM   2
#define PRIORITY_LOW      1

/**
 * @struct PatientRequest
 * @brief Represents a patient demand for medical resources
 */
typedef struct {
    int requestId;
    char patientName[64];
    char resourceType[64];
    char hospital[64];
    int priority; /* 4 = Critical, 3 = High, 2 = Medium, 1 = Low */
    int quantity;
} PatientRequest;

/* Public API Functions */

/**
 * Initializes (or resets) the priority queue
 */
void initQueue(void);

/**
 * Inserts a new patient request into the priority queue (Max Heap)
 * @param request The patient request to insert
 */
void enqueue(PatientRequest request);

/**
 * Removes and returns the highest priority request from the queue
 * @return The highest priority PatientRequest
 */
PatientRequest dequeue(void);

/**
 * Returns the highest priority request without removing it
 * @return The PatientRequest currently at the top of the queue
 */
PatientRequest peek(void);

/**
 * Checks whether the queue currently has no elements
 * @return true if empty, false otherwise
 */
bool isEmpty(void);

/**
 * Prints the current state of the priority queue
 */
void printQueue(void);

/**
 * Returns the current number of requests in the priority queue
 * @return Number of elements currently enqueued
 */
int size(void);

/* Helper functions */
const char* priorityToString(int priority);
int stringToPriority(const char *str);

#endif /* PRIORITY_QUEUE_H */
