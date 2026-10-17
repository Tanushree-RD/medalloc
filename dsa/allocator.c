#include <stdio.h>
#include <stdlib.h>
#include "allocator.h"

void init_engine(void) {
    printf("MedAlloc Engine Ready\n");
    fflush(stdout);
}

int main(void) {
    init_engine();
    return 0;
}
