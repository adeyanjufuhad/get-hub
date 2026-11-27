import { redirect } from "next/navigation";

// Raw course materials and textbooks are not exposed to students.
// Study content lives in the textbook-based notes under /courses.
export default function LibraryPage() {
  redirect("/courses");
}
