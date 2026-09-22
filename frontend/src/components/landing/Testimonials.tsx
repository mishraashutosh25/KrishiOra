import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const defaultTestimonials = {
  title: "Trusted by Farmers Across India",
  reviews: [
    {
      quote: "KrishiOra has completely transformed how I keep track of my paddy crops and fertilizer costs across my 12 acres.",
      author: "Harpreet Singh",
      role: "Paddy & Wheat Farmer, Punjab"
    },
    {
      quote: "Tracking season-by-season expenses has given me the clarity to cut diesel and input wastage by over 20%.",
      author: "Rajesh Patel",
      role: "Cotton & Groundnut Farmer, Gujarat"
    },
    {
      quote: "Finally a platform that my family and I can easily understand and operate right from our farming field.",
      author: "Sanjay Deshmukh",
      role: "Sugarcane & Soybean Farmer, Maharashtra"
    }
  ]
};

export const Testimonials = () => {
  const { t } = useTranslation();
  const testimonialsData = t?.testimonials || defaultTestimonials;
  const reviewsList = testimonialsData?.reviews || defaultTestimonials.reviews;

  // Combine translated text with static images
  const testimonialsWithImages = reviewsList.map((review: { quote: string; author: string; role: string; }, index: number) => {
    const images = [
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
    ];
    return { ...review, image: images[index % images.length] };
  });

  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-emerald-50 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-green-50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
            Social Proof
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {testimonialsData.title}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {testimonialsWithImages.map((testimonial: { quote: string; author: string; role: string; image: string; }, index: number) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-900/5 hover:border-green-200"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <div className="relative mt-6">
                  <Quote className="absolute -left-3 -top-3 h-8 w-8 -rotate-12 text-slate-100" />
                  <p className="relative text-lg leading-7 text-slate-700">
                    "{testimonial.quote}"
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="h-12 w-12 rounded-full object-cover shadow-sm border border-slate-200"
                />
                <div>
                  <div className="font-bold text-slate-900">{testimonial.author}</div>
                  <div className="text-sm text-slate-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
