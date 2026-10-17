#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "allocator.h"

#define BUFFER_SIZE 65536

/**
 * Trims leading and trailing whitespace characters in-place
 */
static char* trim_whitespace(char *str) {
    char *end;

    // Trim leading space
    while (isspace((unsigned char)*str)) {
        str++;
    }

    if (*str == 0) {
        return str;
    }

    // Trim trailing space
    end = str + strlen(str) - 1;
    while (end > str && isspace((unsigned char)*end)) {
        end--;
    }

    // Write new null terminator character
    end[1] = '\0';

    return str;
}

int main(void) {
    char *input_buffer = (char *)malloc(BUFFER_SIZE);
    if (!input_buffer) {
        fprintf(stderr, "{\"error\": \"Failed to allocate memory for input buffer\"}\n");
        return 1;
    }

    size_t total_bytes_read = 0;
    size_t bytes_read = 0;

    // Read all incoming data from stdin until EOF
    while ((bytes_read = fread(input_buffer + total_bytes_read, 1, BUFFER_SIZE - 1 - total_bytes_read, stdin)) > 0) {
        total_bytes_read += bytes_read;
        if (total_bytes_read >= BUFFER_SIZE - 1) {
            break;
        }
    }

    input_buffer[total_bytes_read] = '\0';

    char *trimmed_input = trim_whitespace(input_buffer);

    // If input is empty, fallback to empty JSON object
    const char *received_json = "{}";
    if (strlen(trimmed_input) > 0) {
        if (trimmed_input[0] == '{') {
            received_json = trimmed_input;
        } else {
            // Not enclosed in JSON braces, return empty object
            received_json = "{}";
        }
    }

    // Format and print JSON response to stdout
    printf("{\n");
    printf("  \"success\": true,\n");
    printf("  \"message\": \"Engine Connected\",\n");
    printf("  \"received\": %s\n", received_json);
    printf("}\n");

    fflush(stdout);

    free(input_buffer);
    return 0;
}
