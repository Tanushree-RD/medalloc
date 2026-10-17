#ifndef HASHMAP_H
#define HASHMAP_H

#include <stdbool.h>

/**
 * @file hashmap.h
 * @brief Hash Map with Separate Chaining for MedAlloc Healthcare Resource Lookup
 * 
 * Provides average O(1) time complexity for rapid hospital inventory lookups
 * (Blood groups, critical medicines, ICU beds, etc.) during emergency allocation.
 */

#define HASHMAP_TABLE_SIZE 101

/**
 * @struct ResourceEntry
 * @brief Represents healthcare resources available at a specific hospital
 */
typedef struct {
    char key[64];            /* Unique lookup key: e.g., "A+", "O-", "Paracetamol", "ICU_BEDS", "Blood" */
    int hospitalId;          /* Unique hospital ID */
    char hospitalName[64];   /* Name of facility */
    char bloodGroup[16];     /* Blood group identifier */
    int bloodUnits;          /* Units of blood in stock */
    char medicineName[64];   /* Emergency medication name */
    int medicineStock;       /* Units of medicine in inventory */
    int availableBeds;       /* Number of available ICU/general beds */
} ResourceEntry;

/**
 * @struct HashNode
 * @brief Linked list node for collision resolution via separate chaining
 */
typedef struct HashNode {
    char key[64];
    ResourceEntry data;
    struct HashNode *next;
} HashNode;

/* Core Hash Map API */

/**
 * Initializes (or clears) the hash map bucket table.
 * Time Complexity: O(TABLE_SIZE)
 */
void initHashMap(void);

/**
 * Computes a hash index for a string key using the djb2 algorithm.
 * Time Complexity: O(k) where k is the length of the key string.
 * 
 * @param key Null-terminated string key
 * @return Bucket array index in range [0, HASHMAP_TABLE_SIZE - 1]
 */
unsigned int hash(const char *key);

/**
 * Inserts a ResourceEntry into the hash map.
 * If the key already exists, updates the existing entry in-place.
 * Average Time Complexity: O(1)
 * Worst-case Time Complexity: O(N) on severe hash collision
 * 
 * @param resource The resource record to insert
 */
void insert(ResourceEntry resource);

/**
 * Searches for a resource record by its key.
 * Average Time Complexity: O(1) due to uniform hash distribution across buckets.
 * Worst-case Time Complexity: O(N) if all keys hash to the same bucket chain.
 * 
 * @param key Null-terminated lookup key
 * @return Pointer to matching ResourceEntry, or NULL if not found
 */
ResourceEntry *search(const char *key);

/**
 * Removes an entry matching key from the hash map.
 * Average Time Complexity: O(1)
 * 
 * @param key Key to remove
 */
void removeEntry(const char *key);

/**
 * Prints the hash map structure, populated buckets, and collision chains.
 * Outputs to stderr for debugging/monitoring without polluting stdout JSON.
 */
void printHashMap(void);

/**
 * Frees all allocated nodes in the hash table chains.
 */
void freeHashMap(void);

/**
 * Populates the hash map with initial sample healthcare resource inventory data.
 */
void populateSampleInventory(void);

#endif /* HASHMAP_H */
