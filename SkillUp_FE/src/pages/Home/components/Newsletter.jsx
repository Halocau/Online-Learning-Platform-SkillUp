// src/components/home/Newsletter.jsx
import React from "react";
import { Button } from "@/components/ui/button";

export default function Newsletter() {
  return (
    <section className="py-12 bg-indigo-600 text-center text-white">
      <h2 className="text-2xl font-bold mb-2">Stay Updated!</h2>
      <p className="mb-6">Subscribe to get the latest courses and promotions.</p>
      <div className="flex justify-center gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          className="px-4 py-2 rounded-md text-black w-64"
        />
        <Button>Subscribe</Button>
      </div>
    </section>
  );
}
