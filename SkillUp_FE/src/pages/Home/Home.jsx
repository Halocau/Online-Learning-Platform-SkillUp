import CourseSlider from "./components/CourseSlider";
import HeroCarousel from "./components/HeroCarousel";
import PopularCourses from "./components/PopularCourses";
import Testimonials from "./components/Testimonials";

export default function Home() {
  // Example course data for CourseSlider
  const sampleCourses = [
    {
      title: "ChatGPT for Beginners",
      instructor: "John Doe",
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
      price: "$49",
    },
    {
      title: "Data Science with Python",
      instructor: "Jane Smith",
      image:
        "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80",
      price: "$59",
    },
    {
      title: "Fullstack Web Development",
      instructor: "Michael Lee",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      price: "$79",
    },
  ];

  return (
    <main className="overflow-x-hidden">
      <HeroCarousel />

      <section id="featured-courses" className="bg-gray-50">
        <CourseSlider title="Featured Courses" courses={sampleCourses} />
      </section>

      <section id="popular-courses">
        <PopularCourses />
      </section>

      <section id="testimonials" className="bg-gray-50">
        <Testimonials />
      </section>
    </main>
  );
}
