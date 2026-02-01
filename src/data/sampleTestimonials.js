// Sample testimonials data to populate Firestore database
// You can use this to add initial testimonials to your database

export const sampleTestimonials = [
  {
    text: "I was looking for quality products that would last, and UniqueStore delivered beyond my expectations! Everything feels so premium, and even after multiple uses, the colors and textures stay perfect. My family loves them too!",
    author: "Priya Sharma",
    location: "Delhi",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop",
    rating: 5,
    featured: true,
    status: "active"
  },
  {
    text: "The cushion covers I ordered match perfectly with my living room decor! The fabric quality is excellent, and the zippers are sturdy. Delivery was quick too - ordered on Monday and received by Thursday!",
    author: "Arjun Patel",
    location: "Mumbai",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    rating: 5,
    featured: false,
    status: "active"
  },
  {
    text: "During the busy season, I needed quick delivery and quality essentials, and a friend recommended UniqueStore. Not only are the products amazing, but the customer service helped me choose exactly what I needed. Truly amazing!",
    author: "Kavita Reddy",
    location: "Bangalore",
    image: "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=150&h=150&fit=crop",
    rating: 5,
    featured: false,
    status: "active"
  },
  {
    text: "The dohar I bought is perfect for the winter season. It's warm, lightweight, and the embroidery work is beautiful. My guests always compliment it!",
    author: "Rahul Verma",
    location: "Pune",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    rating: 4,
    featured: false,
    status: "active"
  },
  {
    text: "UniqueStore's customer service is exceptional! They helped me choose the right essentials for my home. The quality is top-notch and the prices are reasonable.",
    author: "Anjali Singh",
    location: "Chennai",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    rating: 5,
    featured: false,
    status: "active"
  },
  {
    text: "I love how UniqueStore offers sustainable and eco-friendly options. The organic collections are not only comfortable but also good for the environment. Highly recommend!",
    author: "Vikram Mehta",
    location: "Hyderabad",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    rating: 5,
    featured: false,
    status: "active"
  },
  {
    text: "The throw blankets are so soft and cozy! Perfect for snuggling on the couch during movie nights. The colors are exactly as shown in the pictures.",
    author: "Neha Kapoor",
    location: "Kolkata",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    rating: 4,
    featured: false,
    status: "active"
  },
  {
    text: "UniqueStore has become my go-to place for all premium lifestyle essentials. Everything is of premium quality. The delivery is always on time!",
    author: "Suresh Kumar",
    location: "Ahmedabad",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    rating: 5,
    featured: false,
    status: "active"
  }
];

// Function to add sample testimonials to Firestore
export const addSampleTestimonialsToFirestore = async (db) => {
  try {
    const { collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore');

    for (const testimonial of sampleTestimonials) {
      const docRef = doc(collection(db, 'testimonials'));
      await setDoc(docRef, {
        ...testimonial,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    console.log('Sample testimonials added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding sample testimonials:', error);
    return false;
  }
};

// Function to get testimonials by status
export const getTestimonialsByStatus = async (db, status = 'active') => {
  try {
    const { collection, getDocs, query, where } = await import('firebase/firestore');

    const testimonialsRef = collection(db, 'testimonials');
    const q = query(testimonialsRef, where('status', '==', status));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
};

// Function to get featured testimonials
export const getFeaturedTestimonials = async (db) => {
  try {
    const { collection, getDocs, query, where, orderBy, limit } = await import('firebase/firestore');

    const testimonialsRef = collection(db, 'testimonials');
    const q = query(
      testimonialsRef,
      where('featured', '==', true),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching featured testimonials:', error);
    return [];
  }
};
