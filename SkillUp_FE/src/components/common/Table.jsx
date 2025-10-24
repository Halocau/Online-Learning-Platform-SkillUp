import React from "react";
import { Button } from "@/components/ui/button";

export default function Table({ columns, data, onEdit, onDelete }) {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
      <table className="min-w-full text-sm text-left border-collapse">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="p-3">
                {col.title}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="p-3 text-right">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {safeData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                className="text-center text-gray-400 py-6"
              >
                No records found
              </td>
            </tr>
          ) : (
            safeData.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="p-3">
                    {col.render
                      ? col.render(item[col.key], item)
                      : item[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="p-3 text-right space-x-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          console.log("Delete clicked", item.id);
                          onDelete(item.id);
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
