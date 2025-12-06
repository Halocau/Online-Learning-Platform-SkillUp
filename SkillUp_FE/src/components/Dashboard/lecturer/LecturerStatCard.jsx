// src/components/lecturer/LecturerStatCard.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const LecturerStatCard = ({ icon: Icon, label, value, bg, border, description }) => (
  <Card className={`rounded-2xl shadow-xl transition-transform duration-200 hover:scale-[1.025] ${bg} ${border}`}>
    <CardContent className="pt-7 pb-7">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold mb-2 opacity-75">{label}</p>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
        </div>
        <div className="p-4 rounded-full bg-white shadow-md ring-2 ring-offset-2 ring-yellow-300 flex items-center justify-center">
          <Icon className="w-8 h-8 text-yellow-600" />
        </div>
      </div>
    </CardContent>
  </Card>
);