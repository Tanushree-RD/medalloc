'use client';

import React, { useState } from 'react';
import {
  Search,
  Building2,
  Plus,
  Minus,
  Edit2,
  Trash2,
  X,
  PackagePlus,
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
  const [statusFilter, setStatusFilter] = useState<'All' | 'Low/Critical' | 'Adequate'>('All');

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

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Low/Critical' && (item.status === 'Low' || item.status === 'Critical')) ||
      (statusFilter === 'Adequate' && item.status === 'Adequate');

    return matchesSearch && matchesCategory && matchesStatus;
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

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const targetHosp = hospitals.find((h) => h.id === Number(newItemHospitalId));

    addInventoryItem({
      hospitalId: Number(newItemHospitalId),
      hospitalName: targetHosp ? targetHosp.name : 'City Hospital',
      category: newItemCategory,
      name: newItemName.trim(),
      stock: Number(newItemStock) || 0,
      minThreshold: Number(newItemMinThreshold) || 2,
      unit: newItemUnit.trim() || 'units',
    });

    setIsAddModalOpen(false);
    setNewItemName('');
    setNewItemStock(10);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Hospital Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Editable stockpile registry. Changes persist immediately and recalculate network availability.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition self-start sm:self-auto"
        >
          <PackagePlus className="h-4 w-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search hospitals or medical items..."
            className="w-full h-8.5 pl-9 pr-3 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 px-1 font-semibold">Category:</span>
            {(['All', 'Blood', 'Medicine', 'ICU Beds', 'Ambulances', 'Doctors'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 px-1 font-semibold">Status:</span>
            {(['All', 'Low/Critical', 'Adequate'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editable Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-medium">
                <th className="py-3 px-5">Hospital</th>
                <th className="py-3 px-5">Resource Item</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Stock Level (Editable)</th>
                <th className="py-3 px-5">Min Threshold</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Last Updated</th>
                <th className="py-3 px-5 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => {
                  const isEditing = editingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Hospital */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            <Building2 className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block truncate">
                              {item.hospitalName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {item.hospitalId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Resource Name */}
                      <td className="py-3.5 px-5 font-bold text-slate-800">
                        {item.name}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-5 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {item.category}
                        </span>
                      </td>

                      {/* Stock Level (EDITABLE!) */}
                      <td className="py-3.5 px-5">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              value={editValue}
                              onChange={(e) => setEditValue(Number(e.target.value))}
                              className="w-16 h-7 px-1.5 font-mono font-bold text-slate-900 border border-blue-500 rounded bg-white text-xs focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInlineEdit(item.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveInlineEdit(item.id)}
                              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-1.5 py-1 text-slate-400 hover:text-slate-600 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => handleStartEditing(item)}
                              className="font-mono font-extrabold text-sm text-slate-900 cursor-pointer hover:text-blue-600 hover:underline"
                              title="Click to edit value directly"
                            >
                              {item.stock} {item.unit}
                            </span>
                            <button
                              onClick={() => handleStartEditing(item)}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
                              title="Edit quantity"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Threshold */}
                      <td className="py-3.5 px-5 font-mono text-slate-500 text-[11px]">
                        {item.minThreshold} {item.unit}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Critical'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : item.status === 'Low'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                        {item.lastUpdated}
                      </td>

                      {/* Quick Actions (+, -, Restock +5, Delete) */}
                      <td className="py-3.5 px-5 text-right space-x-1">
                        <button
                          onClick={() => handleQuickAdjust(item.id, item.stock, -1)}
                          className="h-6 w-6 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 inline-flex items-center justify-center transition"
                          title="Decrease 1 unit"
                        >
                          <Minus className="h-3 w-3" />
                        </button>

                        <button
                          onClick={() => handleQuickAdjust(item.id, item.stock, +1)}
                          className="h-6 w-6 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 inline-flex items-center justify-center transition"
                          title="Increase 1 unit"
                        >
                          <Plus className="h-3 w-3" />
                        </button>

                        <button
                          onClick={() => handleQuickAdjust(item.id, item.stock, +10)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition"
                          title="Quick restock +10"
                        >
                          +10
                        </button>

                        <button
                          onClick={() => deleteInventoryItem(item.id)}
                          className="p-1 rounded text-slate-300 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No matching inventory supplies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Add Inventory Supply Line
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hospital Facility
                </label>
                <select
                  value={newItemHospitalId}
                  onChange={(e) => setNewItemHospitalId(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as InventoryCategory)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
                >
                  <option value="Blood">Blood Products</option>
                  <option value="Medicine">Pharmaceuticals</option>
                  <option value="ICU Beds">ICU Beds</option>
                  <option value="Ambulances">Ambulances</option>
                  <option value="Doctors">Doctors</option>
                  <option value="Equipment">Medical Equipment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supply Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B+ Blood or Atropine (0.5mg)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(Number(e.target.value))}
                    className="w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Min Threshold
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newItemMinThreshold}
                    onChange={(e) => setNewItemMinThreshold(Number(e.target.value))}
                    className="w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="units/vials"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
