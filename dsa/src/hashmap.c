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
 * If the exact same (key, hospitalId) combination exists, updates it in-place.
 * Otherwise prepends a new HashNode to the bucket chain.
 * 
 * Average Time Complexity: O(1)
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

    // Check if (key, hospitalId) already exists in the chain; if so, update
    HashNode *current = g_buckets[bucketIndex];
    while (current != NULL) {
        if (strcasecmp(current->key, resource.key) == 0 &&
            current->data.hospitalId == resource.hospitalId) {
            current->data = resource;
            return;
        }
        current = current->next;
    }

    // Allocate new node and prepend to bucket chain (O(1))
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
 * Returns the first available matching entry.
 * 
 * Average Time Complexity: O(1)
 * 
 * @param key Null-terminated search key
 * @return Pointer to matching ResourceEntry, or NULL if not found
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
 * Searches all hospital entries matching resourceKey and populates outHospitalIds
 * with all distinct hospital IDs having available stock (> 0).
 * 
 * @param resourceKey Key to search (e.g. "A+", "Ventilator", "Paracetamol", "ICU_BEDS")
 * @param outHospitalIds Array to receive matched hospital IDs
 * @param maxResults Maximum elements in outHospitalIds
 * @return Count of distinct hospitals found
 */
int getHospitalsWithResource(const char *resourceKey, int outHospitalIds[], int maxResults) {
    if (!g_initialized || !resourceKey || *resourceKey == '\0' || maxResults <= 0) {
        return 0;
    }

    int foundCount = 0;
    unsigned int bucketIndex = hash(resourceKey);
    HashNode *current = g_buckets[bucketIndex];

    while (current != NULL && foundCount < maxResults) {
        if (strcasecmp(current->key, resourceKey) == 0) {
            int hId = current->data.hospitalId;
            bool alreadyAdded = false;
            for (int i = 0; i < foundCount; i++) {
                if (outHospitalIds[i] == hId) {
                    alreadyAdded = true;
                    break;
                }
            }
            if (!alreadyAdded) {
                outHospitalIds[foundCount++] = hId;
            }
        }
        current = current->next;
    }

    return foundCount;
}

/**
 * Searches for a specific hospital's resource entry by key.
 */
ResourceEntry *searchHospitalResource(const char *key, int hospitalId) {
    if (!g_initialized || !key || *key == '\0') {
        return NULL;
    }

    unsigned int bucketIndex = hash(key);
    HashNode *current = g_buckets[bucketIndex];

    while (current != NULL) {
        if (strcasecmp(current->key, key) == 0 && current->data.hospitalId == hospitalId) {
            return &(current->data);
        }
        current = current->next;
    }

    return NULL;
}

/**
 * Returns currently available stock units for a resource at a given hospital.
 */
int getHospitalResourceStock(const char *key, int hospitalId) {
    ResourceEntry *entry = searchHospitalResource(key, hospitalId);
    if (!entry) {
        if (strcasecmp(key, "A+ Blood") == 0 || strcasecmp(key, "Blood") == 0) {
            entry = searchHospitalResource("A+", hospitalId);
        } else if (strcasecmp(key, "ICU Bed") == 0 || strcasecmp(key, "ICU Beds") == 0) {
            entry = searchHospitalResource("ICU_BEDS", hospitalId);
        }
    }
    if (!entry) return 0;

    if (entry->bloodUnits > 0) return entry->bloodUnits;
    if (entry->medicineStock > 0) return entry->medicineStock;
    if (entry->availableBeds > 0) return entry->availableBeds;
    return 0;
}

/**
 * Decrements the stock quantity for a resource at a hospital.
 */
bool deductHospitalResourceStock(const char *key, int hospitalId, int quantity) {
    ResourceEntry *entry = searchHospitalResource(key, hospitalId);
    if (!entry) {
        if (strcasecmp(key, "A+ Blood") == 0 || strcasecmp(key, "Blood") == 0) {
            entry = searchHospitalResource("A+", hospitalId);
        } else if (strcasecmp(key, "ICU Bed") == 0 || strcasecmp(key, "ICU Beds") == 0) {
            entry = searchHospitalResource("ICU_BEDS", hospitalId);
        }
    }
    if (!entry) return false;

    bool deducted = false;
    if (entry->bloodUnits >= quantity && entry->bloodUnits > 0) {
        entry->bloodUnits -= quantity;
        deducted = true;
    } else if (entry->medicineStock >= quantity && entry->medicineStock > 0) {
        entry->medicineStock -= quantity;
        deducted = true;
    } else if (entry->availableBeds >= quantity && entry->availableBeds > 0) {
        entry->availableBeds -= quantity;
        deducted = true;
    }

    // Also sync alias records if any
    if (deducted) {
        if (strcasecmp(key, "A+") == 0 || strcasecmp(key, "A+ Blood") == 0 || strcasecmp(key, "Blood") == 0) {
            ResourceEntry *a1 = searchHospitalResource("A+", hospitalId);
            ResourceEntry *a2 = searchHospitalResource("Blood", hospitalId);
            ResourceEntry *a3 = searchHospitalResource("A+ Blood", hospitalId);
            if (a1) a1->bloodUnits = entry->bloodUnits;
            if (a2) a2->bloodUnits = entry->bloodUnits;
            if (a3) a3->bloodUnits = entry->bloodUnits;
        } else if (strcasecmp(key, "ICU_BEDS") == 0 || strcasecmp(key, "ICU Bed") == 0 || strcasecmp(key, "ICU Beds") == 0) {
            ResourceEntry *b1 = searchHospitalResource("ICU_BEDS", hospitalId);
            ResourceEntry *b2 = searchHospitalResource("ICU Bed", hospitalId);
            if (b1) b1->availableBeds = entry->availableBeds;
            if (b2) b2->availableBeds = entry->availableBeds;
        }
    }

    return deducted;
}

/**
 * Removes an entry matching the given key from the hash map.
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
                fprintf(stderr, "-> [Key: \"%s\" | #%d %s | Blood: %s (%d) | Med: %s (%d) | Beds: %d] ",
                        curr->key,
                        curr->data.hospitalId,
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
 * Populates the hash map with sample hospital inventory data mapped to the 5 regional hospitals.
 */
void populateSampleInventory(void) {
    initHashMap();

    // 1. Hospital 1: City Hospital (Hub)
    ResourceEntry r1_blood = { "A+", 1, "City Hospital", "A+", 12, "N/A", 0, 8 };
    ResourceEntry r1_alias = { "Blood", 1, "City Hospital", "A+", 12, "N/A", 0, 8 };
    ResourceEntry r1_med   = { "Paracetamol", 1, "City Hospital", "N/A", 0, "Paracetamol (500mg IV)", 350, 8 };
    ResourceEntry r1_beds  = { "ICU_BEDS", 1, "City Hospital", "N/A", 0, "N/A", 0, 8 };

    // 2. Hospital 2: General Hospital
    ResourceEntry r2_blood = { "O-", 2, "General Hospital", "O-", 5, "N/A", 0, 14 };
    ResourceEntry r2_oxy   = { "Oxygen Cylinder", 2, "General Hospital", "N/A", 0, "Medical Oxygen 50L", 45, 14 };
    ResourceEntry r2_beds  = { "ICU_BEDS", 2, "General Hospital", "N/A", 0, "N/A", 0, 14 };

    // 3. Hospital 3: Sunrise Medical Center
    ResourceEntry r3_blood = { "A+", 3, "Sunrise Medical Center", "A+", 10, "N/A", 0, 22 };
    ResourceEntry r3_alias = { "Blood", 3, "Sunrise Medical Center", "A+", 10, "N/A", 0, 22 };
    ResourceEntry r3_ab    = { "AB+", 3, "Sunrise Medical Center", "AB+", 18, "N/A", 0, 22 };
    ResourceEntry r3_vent  = { "Ventilator", 3, "Sunrise Medical Center", "N/A", 0, "N/A", 0, 10 };
    ResourceEntry r3_beds  = { "ICU_BEDS", 3, "Sunrise Medical Center", "N/A", 0, "N/A", 0, 22 };

    // 4. Hospital 4: Apollo Care
    ResourceEntry r4_vent  = { "Ventilator", 4, "Apollo Care", "N/A", 0, "N/A", 0, 8 };
    ResourceEntry r4_med   = { "Paracetamol", 4, "Apollo Care", "N/A", 0, "Paracetamol (500mg IV)", 100, 16 };
    ResourceEntry r4_beds  = { "ICU_BEDS", 4, "Apollo Care", "N/A", 0, "N/A", 0, 16 };

    // 5. Hospital 5: Metro Hospital
    ResourceEntry r5_blood = { "O-", 5, "Metro Hospital", "O-", 15, "N/A", 0, 12 };
    ResourceEntry r5_oxy   = { "Oxygen Cylinder", 5, "Metro Hospital", "N/A", 0, "Medical Oxygen 50L", 30, 12 };
    ResourceEntry r5_beds  = { "ICU_BEDS", 5, "Metro Hospital", "N/A", 0, "N/A", 0, 12 };

    // Insert records
    insert(r1_blood);
    insert(r1_alias);
    insert(r1_med);
    insert(r1_beds);

    insert(r2_blood);
    insert(r2_oxy);
    insert(r2_beds);

    insert(r3_blood);
    insert(r3_alias);
    insert(r3_ab);
    insert(r3_vent);
    insert(r3_beds);

    insert(r4_vent);
    insert(r4_med);
    insert(r4_beds);

    insert(r5_blood);
    insert(r5_oxy);
    insert(r5_beds);

    // Direct user-facing aliases
    ResourceEntry r1_blood_full = { "A+ Blood", 1, "City Hospital", "A+", 12, "N/A", 0, 8 };
    ResourceEntry r3_blood_full = { "A+ Blood", 3, "Sunrise Medical Center", "A+", 10, "N/A", 0, 22 };
    insert(r1_blood_full);
    insert(r3_blood_full);

    ResourceEntry r1_icu = { "ICU Bed", 1, "City Hospital", "N/A", 0, "N/A", 0, 8 };
    ResourceEntry r2_icu = { "ICU Bed", 2, "General Hospital", "N/A", 0, "N/A", 0, 14 };
    ResourceEntry r3_icu = { "ICU Bed", 3, "Sunrise Medical Center", "N/A", 0, "N/A", 0, 22 };
    ResourceEntry r4_icu = { "ICU Bed", 4, "Apollo Care", "N/A", 0, "N/A", 0, 16 };
    ResourceEntry r5_icu = { "ICU Bed", 5, "Metro Hospital", "N/A", 0, "N/A", 0, 12 };
    insert(r1_icu);
    insert(r2_icu);
    insert(r3_icu);
    insert(r4_icu);
    insert(r5_icu);
}
