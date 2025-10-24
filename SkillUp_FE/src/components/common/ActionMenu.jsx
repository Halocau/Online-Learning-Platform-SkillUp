// src/components/ActionMenu.js

import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const ActionMenu = ({ onEdit, onDelete }) => {
  return (
    <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
      <div className="py-1">
        <button
          onClick={onEdit}
          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          <PencilIcon className="h-4 w-4" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <TrashIcon className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ActionMenu;