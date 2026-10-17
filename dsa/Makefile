# MedAlloc Algorithm Engine Makefile
# Tech Stack: C (C17 / C11 fallback for legacy compilers), GCC

CC = gcc
CFLAGS ?= -std=c11 -Wall -Wextra -O2 -Iinclude -I.

BUILD_DIR = build
SRCS = allocator.c src/priority_queue.c
HEADERS = allocator.h include/priority_queue.h

ifeq ($(OS),Windows_NT)
	TARGET = $(BUILD_DIR)/allocator.exe
	RM = cmd /C del /Q /F
	FIXPATH = $(subst /,\,$(1))
else
	TARGET = $(BUILD_DIR)/allocator
	RM = rm -f
	FIXPATH = $(1)
endif

.PHONY: all clean run

all: $(TARGET)

$(TARGET): $(SRCS) $(HEADERS)
	$(CC) $(CFLAGS) $(SRCS) -o $(TARGET)

run: $(TARGET)
	./$(TARGET)

clean:
	-$(RM) $(call FIXPATH,$(TARGET))
