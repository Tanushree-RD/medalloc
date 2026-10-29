'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  X,
} from 'lucide-react';
import { useMedAlloc } from '@/context/MedAllocContext';
import { InventoryCategory, InventoryItem } from '@/lib/types';

export function InventoryView() {
  const {
    inventory,
    hospitals,
    updateInventoryItemStock,
    addInventoryItem,
    deleteInventoryItem,
    globalSearchQuery,
  } = useMedAlloc();

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | InventoryCategory>('All');

  // Inline Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  // Add Item Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemHospitalId, setNewItemHospitalId] = useState<number>(hospitals[0]?.id || 1);
  const [newItemCategory, setNewItemCategory] = useState<InventoryCategory>('Blood');
  const [newItemName, setNewItemName] = useState('');
  const [newItemStock, setNewItemStock] = useState<number>(10);
  const [newItemMinThreshold, setNewItemMinThreshold] = useState<number>(4);
  const [newItemUnit, setNewItemUnit] = useState('units');

  const effectiveSearch = searchFilter || globalSearchQuery;

  // Filter Inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      !effectiveSearch ||
      item.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      item.hospitalName.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleStartEditing = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditValue(item.stock);
  };

  const handleSaveInlineEdit = (id: string) => {
    updateInventoryItemStock(id, editValue);
    setEditingId(null);
  };

  const handleQuickAdjust = (id: string, currentStock: number, delta: number) => {
    const nextStock = Math.max(0, currentStock + delta);
    updateInventoryItemStock(id, nextStock);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const matchedHospital = hospitals.find((h) => h.id === newItemHospitalId);
    const hospitalName = matchedHospital ? matchedHospital.name : 'Regional Hospital';

    addInventoryItem({
      hospitalId: newItemHospitalId,
      hospitalName,
      category: newItemCategory,
      name: newItemName.trim(),
      stock: newItemStock,
      minThreshold: newItemMinThreshold,
      unit: newItemUnit,
    });

    setNewItemName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-neutral-950">
            Regional Stockpile Inventory
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1">
            Real-time supply tracking with automatic reservation and threshold dispatch alerts.
          </p>
        </div>

        {/* Add Item Trigger */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium shadow-editorial transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2]" />
          <span>Add Stockpile Item</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Blood', 'Medicine', 'Equipment', 'Oxygen'] as Array<'All' | InventoryCategory>).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neutral-950 text-white shadow-2xs'
                  : 'bg-white border border-black/[0.05] text-neutral-600 hover:text-neutral-950'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search supplies or hospitals..."
            className="w-full h-9 pl-9 pr-3 rounded-full bg-white border border-black/[0.06] text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950 transition"
          />
        </div>
      </div>

      {/* Modern Database Table / Card View (Notion style) */}
      <div className="bg-white rounded-3xl border border-black/[0.04] shadow-editorial overflow-hidden">
        <div className="divide-y divide-black/[0.04]">
          {filteredInventory.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400">
              No inventory records match your criteria
            </div>
          ) : (
            filteredInventory.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/60 transition-colors"
              >
                {/* Left: Item metadata */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        item.status === 'Critical'
                          ? 'bg-rose-500'
                          : item.status === 'Low'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="text-sm font-semibold tracking-tight text-neutral-950 truncate">
                      {item.name}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      [{item.category}]
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500">
                    {item.hospitalName} · Safe threshold: {item.minThreshold} {item.unit}
                  </p>
                </div>

                {/* Right: Quantity Stepper & Edit */}
                <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                  {/* Stepper */}
                  <div className="flex items-center gap-2 bg-neutral-100/80 p-1 rounded-full">
                    <button
                      onClick={() => handleQuickAdjust(item.id, item.stock, -1)}
                      className="h-7 w-7 rounded-full bg-white hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
                      title="Decrease"
                    >
                      <Minus className="h-3 w-3" />
                    </button>

                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        onBlur={() => handleSaveInlineEdit(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveInlineEdit(item.id);
                        }}
                        autoFocus
                        className="w-14 text-center font-mono font-semibold text-xs text-neutral-950 bg-white rounded py-0.5 outline-none"
                      />
                    ) : (
                      <span
                        onClick={() => handleStartEditing(item)}
                        className="font-mono font-semibold text-xs text-neutral-950 w-14 text-center cursor-pointer hover:underline"
                        title="Click to manually edit"
                      >
                        {item.stock} {item.unit}
                      </span>
                    )}

                    <button
                      onClick={() => handleQuickAdjust(item.id, item.stock, 1)}
                      className="h-7 w-7 rounded-full bg-white hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
                      title="Increase"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${item.name} from ${item.hospitalName}?`)) {
                        deleteInventoryItem(item.id);
                      }
                    }}
                    className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full border border-black/[0.06] shadow-editorial-float p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
                Add Stockpile Item
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-600">Facility</label>
                <select
                  value={newItemHospitalId}
                  onChange={(e) => setNewItemHospitalId(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-neutral-50/70 border border-black/[0.06] text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-600">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as InventoryCategory)}
                  className="w-full h-10 px-3 rounded-xl bg-neutral-50/70 border border-black/[0.06] text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                >
                  <option value="Blood">Blood Products</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Oxygen">Oxygen</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-600">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. O+ Blood Bags / Ventilators"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-neutral-50/70 border border-black/[0.06] text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-600">Initial Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-neutral-50/70 border border-black/[0.06] text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-600">Min Threshold</label>
                  <input
                    type="number"
                    min={1}
                    value={newItemMinThreshold}
                    onChange={(e) => setNewItemMinThreshold(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-neutral-50/70 border border-black/[0.06] text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-600">Unit</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="units/vials"
                    className="w-full h-10 px-3 rounded-xl bg-neutral-50/70 border border-black/[0.06] text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium transition cursor-pointer mt-2"
              >
                Register Stockpile Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
