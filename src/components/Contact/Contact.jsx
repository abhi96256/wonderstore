import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { BsFacebook, BsInstagram } from "react-icons/bs";
import { db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import "./Contact.css";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if email already exists
      const contactsQuery = query(
        collection(db, "contacts"),
        where("email", "==", form.email)
      );
      const querySnapshot = await getDocs(contactsQuery);

      if (!querySnapshot.empty) {
        throw new Error('A contact with this email address already exists');
      }

      // Add document to 'contacts' collection in Firestore
      await addDoc(collection(db, "contacts"), {
        ...form,
        timestamp: serverTimestamp(),
      });

      setSuccess(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const formVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.2
      }
    }
  };

  const infoVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.4
      }
    }
  };

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  const socialIconVariants = {
    hover: {
      y: -5,
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 300
      }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <motion.div
      className="contact-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="contact-card">
        <motion.div
          className="contact-card-content"
          variants={containerVariants}
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="contact-form-area"
            variants={formVariants}
          >
            <motion.h1
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Let's talk
            </motion.h1>
            <motion.p
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              To request a quote or want to meet up for coffee, contact us directly or fill out the form and we will get back to you promptly.
            </motion.p>

            <motion.form
              className="contact-form"
              onSubmit={handleSubmit}
              variants={itemVariants}
            >
              <motion.div
                className="form-group"
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
              >
                <label htmlFor="name">Your Name</label>
                <motion.input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </motion.div>
              <motion.div
                className="form-group"
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
              >
                <label htmlFor="email">Your Email</label>
                <motion.input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </motion.div>
              <motion.div
                className="form-group"
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
              >
                <label htmlFor="message">Your Message</label>
                <motion.textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  required
                  variants={inputVariants}
                  whileFocus="focus"
                ></motion.textarea>
              </motion.div>
              <motion.button
                type="submit"
                className="submit-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </motion.button>
              {success && (
                <motion.div
                  className="success-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span>✓ Message sent successfully!</span>
                </motion.div>
              )}
            </motion.form>
          </motion.div>

          <motion.div
            className="contact-info-area"
            variants={infoVariants}
          >
            <motion.div className="contact-details-row">
              <motion.div className="contact-details-col" variants={itemVariants}>
                <FaMapMarkerAlt size={32} />
                <h3>Office</h3>
                <p>Corporate - B-206, 2nd Floor, Puri High Street, Sec-81,<br />Faridabad, Haryana-121004<br />INDIA</p>
              </motion.div>
              <motion.div className="contact-details-col" variants={itemVariants}>
                <FaPhoneAlt size={32} />
                <h3>Whatsapp Contact

                </h3>
                <p>+91 9355031087<br />Mon-Sat: 10 AM-6 PM</p>
              </motion.div>
              <motion.div className="contact-details-col" variants={itemVariants}>
                <FaEnvelope size={32} />
                <h3>Mail</h3>
                <p >info@uniquestore.com</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Contact; 
