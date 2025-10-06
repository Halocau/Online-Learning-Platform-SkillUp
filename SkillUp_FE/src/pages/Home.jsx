import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="mt-20">
      {" "}
      <section className="text-center py-24 bg-gradient-to-r from-blue-50 to-indigo-100">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Learn new skills and level up your career with{" "}
          <span className="text-purple-600">SkillUp</span>
        </h1>
        <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
          Access world-class courses from industry experts and build your future
          today.
        </p>
        <p className="mt-3 text-indigo-100">
          Join thousands of learners achieving their goals with SkillUp.
        </p>
        <Button className="mt-8 px-6 py-5 text-lg bg-white text-indigo-600 hover:bg-gray-100">
          <Link to="/login" className="flex items-center">
            Get Started
          </Link>
          <ArrowRight className="ml-0.5 h-5 w-5" />
        </Button>
      </section>
      <section className="py-20 max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
        {[
          {
            title: "Expert Instructors",
            desc: "Learn directly from professionals with real-world experience.",
          },
          {
            title: "Flexible Learning",
            desc: "Study anytime, anywhere with lifetime access to your courses.",
          },
          {
            title: "Recognized Certificates",
            desc: "Boost your resume with verified SkillUp certificates.",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="p-6 bg-white border rounded-2xl shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              {item.title}
            </h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}
      </section>
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Popular Courses
          </h2>
          <div className="grid md:grid-cols-3 gap-6 px-6">
            {["Web Development", "UI/UX Design", "Data Science"].map(
              (course, i) => (
                <div
                  key={i}
                  className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-lg"
                >
                  <h3 className="text-lg font-semibold">{course}</h3>
                  <p className="text-gray-500 mt-2">
                    Learn {course.toLowerCase()} with structured paths and
                    expert mentors.
                  </p>
                  <Button variant="outline" className="mt-4">
                    View Course
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
