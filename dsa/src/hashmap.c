#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <ctype.h>
#include "../include/hashmap.h"

/**
 * Global bucket table for the hash map.
 * Each bucket holds the head of a singly linked list (separate chaining).
 */
static HashNode *g_buckets[HASHMAP_TABLE_SIZE];
static bool g_initialized = false;

/**
 * Initializes (or clears) the hash map bucket table.
 * Sets all bucket pointers to NULL.
 * 
 * Time Complexity: O(HASHMAP_TABLE_SIZE)
 */
void initHashMap(void) {
    if (g_initialized) {
        freeHashMap();
    }
    for (int i = 0; i < HASHMAP_TABLE_SIZE; i++) {
        g_buckets[i] = NULL;
    }
    g_initialized = true;
}

/**
 * Hash function implementing Dan Bernstein's djb2 algorithm.
 * Computes a pseudo-random, uniformly distributed bucket index.
 * Case-insensitive hashing ensures keys like "A+" and "a+" map to the same bucket.
 * 
 * Mathematical properties:
 * - Constant multiplier 33 ((hash << 5) + hash) minimizes clustering.
 * - Modulo prime table size (101) provides uniform distribution.
 * 
 * Time Complexity: O(k) where k is the string length of the key.
 * 
 * @param key Null-terminated key string
 * @return Computed bucket index in range [0, HASHMAP_TABLE_SIZE - 1]
 */
unsigned int hash(const char *key) {
    if (!key || *key == '\0') {
        return 0;
    }
    unsigned long hashValue = 5381;
    int c;
    while ((c = (unsigned char)*key++)) {
        hashValue = ((hashValue << 5) + hashValue) + tolower(c);
    }
    return (unsigned int)(hashValue % HASHMAP_TABLE_SIZE);
}

/**
 * Inserts a ResourceEntry into the hash map using separate chaining.
 * 
 * Lookup & Collision Resolution:
 * 1. Computes the hash index for the entry's key in O(k) time.
 * 2. Traverses the chain at g_buckets[index].
 * 3. If an existing entry with the same key is found, updates it in-place.
 * 4. If not found, allocates a new HashNode and prepends it to the chain in O(1).
 * 
 * Complexity:
 * - Average Time Complexity: O(1) assuming uniform hash distribution and low load factor.
 * - Worst-Case Time Complexity: O(N) if all N keys collide in the same bucket chain.
 * - Space Complexity: O(1) auxiliary per insertion.
 * 
 * @param resource The resource entry to store
 */
void insert(ResourceEntry resource) {
    if (!g_initialized) {
        initHashMap();
    }

    if (strlen(resource.key) == 0) {
        fprintf(stderr, "[HashMap Warning] Attempted to insert entry with empty key\n");
        return;
    }

    unsigned int bucketIndex = hash(resource.key);

    // Check if key already exists in the chain; if so, update
    HashNode *current = g_buckets[bucketIndex];
    while (current != NULL) {
        if (strcasecmp(current->key, resource.key) == 0) {
            current->data = resource;
            return;
        }
        current = current->next;
    }

    // Key not found: allocate new node and prepend to bucket chain (O(1))
    HashNode *newNode = (HashNode *)malloc(sizeof(HashNode));
    if (!newNode) {
        fprintf(stderr, "[HashMap Error] Failed to allocate memory for HashNode\n");
        exit(EXIT_FAILURE);
    }

    strncpy(newNode->key, resource.key, sizeof(newNode->key) - 1);
    newNode->key[sizeof(newNode->key) - 1] = '\0';
    newNode->data = resource;
    newNode->next = g_buckets[bucketIndex];
    g_buckets[bucketIndex] = newNode;
}

/**
 * Searches for a ResourceEntry by key.
 * 
 * Complexity:
 * - Average Time Complexity: O(1).
 *   With N keys distributed across M = 101 buckets, average chain length is
 *   the load factor alpha = N / M. For sparse healthcare resource tables,
 *   alpha << 1, meaning lookup evaluates in constant time O(1).
 * - Worst-case: O(N) in the degenerate case of all keys colliding.
 * 
 * @param key Null-terminated search key (e.g. "A+", "Paracetamol", "ICU_BEDS")
 * @return Pointer to matching ResourceEntry, or NULL if key does not exist
 */
ResourceEntry *search(const char *key) {
    if (!g_initialized || !key || *key == '\0') {
        return NULL;
    }

    unsigned int bucketIndex = hash(key);
    HashNode *current = g_buckets[bucketIndex];

    while (current != NULL) {
        if (strcasecmp(current->key, key) == 0) {
            return &(current->data);
        }
        current = current->next;
    }

    return NULL;
}

/**
 * Removes an entry matching the given key from the hash map.
 * Frees the associated node from the bucket chain.
 * 
 * Average Time Complexity: O(1)
 * 
 * @param key Key of the entry to remove
 */
void removeEntry(const char *key) {
    if (!g_initialized || !key || *key == '\0') {
        return;
    }

    unsigned int bucketIndex = hash(key);
    HashNode *current = g_buckets[bucketIndex];
    HashNode *prev = NULL;

    while (current != NULL) {
        if (strcasecmp(current->key, key) == 0) {
            if (prev == NULL) {
                g_buckets[bucketIndex] = current->next;
            } else {
                prev->next = current->next;
            }
            free(current);
            return;
        }
        prev = current;
        current = current->next;
    }
}

/**
 * Prints the entire hash table structure, non-empty buckets, and linked chains.
 * Outputs to stderr so that JSON communication on stdout remains undisturbed.
 */
void printHashMap(void) {
    fprintf(stderr, "\n==================== Hash Map Inventory (Table Size: %d) ====================\n", HASHMAP_TABLE_SIZE);
    int totalEntries = 0;
    int occupiedBuckets = 0;

    for (int i = 0; i < HASHMAP_TABLE_SIZE; i++) {
        if (g_buckets[i] != NULL) {
            occupiedBuckets++;
            fprintf(stderr, "Bucket [%03d]: ", i);
            HashNode *curr = g_buckets[i];
            int chainLen = 0;
            while (curr != NULL) {
                chainLen++;
                totalEntries++;
                fprintf(stderr, "-> [Key: \"%s\" | Hospital: %s | Blood: %s (%d) | Med: %s (%d) | Beds: %d] ",
                        curr->key,
                        curr->data.hospitalName,
                        curr->data.bloodGroup,
                        curr->data.bloodUnits,
                        curr->data.medicineName,
                        curr->data.medicineStock,
                        curr->data.availableBeds);
                curr = curr->next;
            }
            fprintf(stderr, "(Chain length: %d)\n", chainLen);
        }
    }
    fprintf(stderr, "--------------------------------------------------------------------------------\n");
    fprintf(stderr, "Total Entries: %d | Occupied Buckets: %d | Load Factor: %.2f\n",
            totalEntries, occupiedBuckets, (float)totalEntries / HASHMAP_TABLE_SIZE);
    fprintf(stderr, "================================================================================\n\n");
    fflush(stderr);
}

/**
 * Traverses all buckets and frees all allocated HashNodes.
 */
void freeHashMap(void) {
    if (!g_initialized) {
        return;
    }

    for (int i = 0; i < HASHMAP_TABLE_SIZE; i++) {
        HashNode *curr = g_buckets[i];
        while (curr != NULL) {
            HashNode *temp = curr;
            curr = curr->next;
            free(temp);
        }
        g_buckets[i] = NULL;
    }
    g_initialized = false;
}

/**
 * Populates the hash map with sample hospital inventory data.
 * Covers blood groups, emergency medications, ICU beds, and general medical resources.
 */
void populateSampleInventory(void) {
    initHashMap();

    // 1. Blood Inventory: A+
    ResourceEntry r1 = {
        .key = "A+",
        .hospitalId = 1,
        .hospitalName = "City Hospital",
        .bloodGroup = "A+",
        .bloodUnits = 12,
        .medicineName = "N/A",
        .medicineStock = 0,
        .availableBeds = 8
    };

    // 2. Blood Inventory: O- (Universal Donor)
    ResourceEntry r2 = {
        .key = "O-",
        .hospitalId = 2,
        .hospitalName = "Metro General",
        .bloodGroup = "O-",
        .bloodUnits = 5,
        .medicineName = "N/A",
        .medicineStock = 0,
        .availableBeds = 14
    };

    // 3. Blood Inventory: AB+
    ResourceEntry r3 = {
        .key = "AB+",
        .hospitalId = 3,
        .hospitalName = "St. Jude Hospital",
        .bloodGroup = "AB+",
        .bloodUnits = 18,
        .medicineName = "N/A",
        .medicineStock = 0,
        .availableBeds = 22
    };

    // 4. Emergency Medication: Paracetamol
    ResourceEntry r4 = {
        .key = "Paracetamol",
        .hospitalId = 1,
        .hospitalName = "City Hospital",
        .bloodGroup = "N/A",
        .bloodUnits = 0,
        .medicineName = "Paracetamol (500mg IV)",
        .medicineStock = 350,
        .availableBeds = 8
    };

    // 5. Critical Infrastructure: ICU Beds
    ResourceEntry r5 = {
        .key = "ICU_BEDS",
        .hospitalId = 4,
        .hospitalName = "Apex Heart & Trauma Center",
        .bloodGroup = "N/A",
        .bloodUnits = 0,
        .medicineName = "N/A",
        .medicineStock = 0,
        .availableBeds = 16
    };

    // 6. Generic Blood lookup alias
    ResourceEntry r6 = {
        .key = "Blood",
        .hospitalId = 1,
        .hospitalName = "City Hospital",
        .bloodGroup = "A+",
        .bloodUnits = 12,
        .medicineName = "N/A",
        .medicineStock = 0,
        .availableBeds = 8
    };

    // 7. Ventilator lookup
    ResourceEntry r7 = {
        .key = "Ventilator",
        .hospitalId = 4,
        .hospitalName = "Apex Health",
        .bloodGroup = "N/A",
        .bloodUnits = 0,
        .medicineName = "N/A",
        .medicineStock = 0,
        .availableBeds = 10
    };

    // 8. Oxygen Cylinder lookup
    ResourceEntry r8 = {
        .key = "Oxygen Cylinder",
        .hospitalId = 2,
        .hospitalName = "St. Mary Medical",
        .bloodGroup = "N/A",
        .bloodUnits = 0,
        .medicineName = "Medical Oxygen 50L",
        .medicineStock = 45,
        .availableBeds = 14
    };

    // Insert all sample resources into the Hash Map
    insert(r1);
    insert(r2);
    insert(r3);
    insert(r4);
    insert(r5);
    insert(r6);
    insert(r7);
    insert(r8);
}
