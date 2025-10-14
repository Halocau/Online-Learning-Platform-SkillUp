import React from "react";
import { Button } from "@/components/ui/button";

export default function Table({ columns, data, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
      <table className="min-w-full text-sm text-left border-collapse">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="p-3">{col.title}</th>
            ))}
            {(onEdit || onDelete) && <th className="p-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="p-3">
                  {col.render ? col.render(item[col.key], item) : item[col.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="p-3 text-right space-x-2">
                  {onEdit && <Button variant="outline" size="sm" onClick={() => onEdit(item)}>Edit</Button>}
                  {onDelete && <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>Delete</Button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
