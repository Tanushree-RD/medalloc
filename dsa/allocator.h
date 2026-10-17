#ifndef ALLOCATOR_H
#define ALLOCATOR_H

/**
 * @file allocator.h
 * @brief MedAlloc Engine - Core allocation engine header
 * 
 * MedAlloc algorithm engine designed to communicate with the Express backend
 * via standard I/O (stdin/stdout) using JSON payloads.
 */

#define ENGINE_VERSION "1.0.0"

/* Initializes the MedAlloc engine */
void init_engine(void);

#endif /* ALLOCATOR_H */
