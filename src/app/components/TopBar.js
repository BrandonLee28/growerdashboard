import { motion } from "framer-motion";

const TopBar = ({ router, data, toggleData }) => {
  return (
    <div className="topbar">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          router.push("/");
        }}
        className="topbar-goback"
      >
        Go Back
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="topbar-selector"
        onClick={() => {
          toggleData();
        }}
      >
        {data === "../to_zipcode_estab.csv" ? "ESTAB" : "Outage"}
      </motion.button>
    </div>
  );
};

export default TopBar;
