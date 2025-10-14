import React, { useState, useEffect } from "react";
import Table from "@/components/common/Table";
import FilterBar from "@/components/common/FilterBar";
import FormModal from "@/components/common/FormModal";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { newsColumns, newsFilters, newsFields } from "./newsConfig";

export default function NewsManage() {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Placeholder for future API integration
    setTimeout(() => {
      setData([
        { id: 1, title: "SkillUp Platform Launched", category: "Education", date: "2025-10-06", status: "Published" },
      ]);
    }, 500);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">News Management</h2>
        
      </div>

      <FilterBar filters={newsFilters} onSearch={(v) => console.log("search:", v)} />

      <Table
        columns={newsColumns}
        data={data}
        onEdit={(item) => {
          setFormData(item);
          setOpen(true);
        }}
        onDelete={(id) => setData((prev) => prev.filter((x) => x.id !== id))}
      />

      <FormModal
        open={open}
        onClose={() => setOpen(false)}
        title="Add / Edit News"
        fields={newsFields}
        values={formData}
        onChange={(k, v) => setFormData((prev) => ({ ...prev, [k]: v }))}
        onSubmit={() => {
          console.log("Submit:", formData);
          setOpen(false);
        }}
      />
    </div>
  );
}
