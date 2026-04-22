import { motion } from 'framer-motion';

/**
 * Animation Demo Component
 * Shows how to use Framer Motion and Tailwind animations
 */

export const AnimationDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold text-center mb-12 text-gradient"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          🎨 Animation Showcase
        </motion.h1>

        {/* Framer Motion Examples */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-200">🚀 Framer Motion Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Fade & Scale */}
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3 className="text-lg font-bold text-blue-400 mb-2">Fade & Scale</h3>
              <p className="text-gray-400">Hover and click me!</p>
            </motion.div>

            {/* Rotate & Color */}
            <motion.div
              className="card p-6"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              whileHover={{ 
                rotate: 5,
                backgroundColor: "#3b82f6",
                color: "#ffffff"
              }}
            >
              <h3 className="text-lg font-bold text-purple-400 mb-2">Rotate & Color</h3>
              <p className="text-gray-400">Hover to change!</p>
            </motion.div>

            {/* Bounce */}
            <motion.div
              className="card p-6"
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              transition={{ 
                type: "spring",
                bounce: 0.5,
                duration: 1
              }}
              whileHover={{ y: -10 }}
            >
              <h3 className="text-lg font-bold text-pink-400 mb-2">Spring Bounce</h3>
              <p className="text-gray-400">Spring physics!</p>
            </motion.div>

            {/* Staggered List */}
            <motion.div
              className="card p-6"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-green-400 mb-3">Staggered List</h3>
              {['Item 1', 'Item 2', 'Item 3'].map((item, i) => (
                <motion.div
                  key={item}
                  className="bg-green-900/30 text-green-300 p-2 rounded mb-2 text-sm"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  {item}
                </motion.div>
              ))}
            </motion.div>

            {/* Drag */}
            <motion.div
              className="card p-6 cursor-move"
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.2}
              whileDrag={{ scale: 1.1, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
            >
              <h3 className="text-lg font-bold text-orange-400 mb-2">Draggable</h3>
              <p className="text-gray-400">Try dragging me!</p>
            </motion.div>

            {/* Path Animation */}
            <motion.div
              className="card p-6"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <h3 className="text-lg font-bold text-red-400 mb-2">Infinite Loop</h3>
              <p className="text-gray-400">Continuous animation</p>
            </motion.div>
          </div>
        </div>

        {/* Tailwind CSS Animations */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-200">✨ Tailwind CSS Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="card p-6 animate-fade-in">
              <h3 className="text-lg font-bold text-blue-400 mb-2">Fade In</h3>
              <p className="text-gray-400">animate-fade-in</p>
            </div>

            <div className="card p-6 animate-slide-up">
              <h3 className="text-lg font-bold text-purple-400 mb-2">Slide Up</h3>
              <p className="text-gray-400">animate-slide-up</p>
            </div>

            <div className="card p-6 animate-float">
              <h3 className="text-lg font-bold text-pink-400 mb-2">Float</h3>
              <p className="text-gray-400">animate-float</p>
            </div>

            <div className="card p-6 animate-pulse">
              <h3 className="text-lg font-bold text-green-400 mb-2">Pulse</h3>
              <p className="text-gray-400">animate-pulse (built-in)</p>
            </div>

            <div className="card p-6 animate-bounce">
              <h3 className="text-lg font-bold text-orange-400 mb-2">Bounce</h3>
              <p className="text-gray-400">animate-bounce (built-in)</p>
            </div>

            <div className="card p-6 animate-spin">
              <div className="text-center">
                <h3 className="text-lg font-bold text-red-400 mb-2">Spin</h3>
                <div className="inline-block">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-6 hover:animate-wiggle">
              <h3 className="text-lg font-bold text-indigo-400 mb-2">Wiggle (Hover)</h3>
              <p className="text-gray-400">hover:animate-wiggle</p>
            </div>

            <div className="card p-6 hover:animate-shake">
              <h3 className="text-lg font-bold text-yellow-400 mb-2">Shake (Hover)</h3>
              <p className="text-gray-400">hover:animate-shake</p>
            </div>

            <div className="card p-6 animate-glow">
              <h3 className="text-lg font-bold text-cyan-400 mb-2">Glow</h3>
              <p className="text-gray-400">animate-glow</p>
            </div>
          </div>
        </div>

        {/* Combined Examples */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-200">🎯 Combined Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Button with Framer Motion */}
            <motion.button
              className="btn-primary w-full py-4 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.4)", "0 0 0 10px rgba(59, 130, 246, 0)"] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              Animated Button with Pulse
            </motion.button>

            {/* Card with Multiple Effects */}
            <motion.div
              className="stat-card bg-gradient-to-br from-blue-500 to-purple-600 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-2xl font-bold mb-2">₹12,450.00</h3>
              <p className="text-blue-100">Total Expenses</p>
            </motion.div>
          </div>
        </div>

        {/* Usage Guide */}
        <motion.div 
          className="mt-16 card bg-gradient-to-br from-gray-800 to-gray-900 text-white p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-blue-400">📚 How to Use</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Framer Motion:</h3>
              <pre className="bg-gray-950 p-3 rounded text-sm overflow-x-auto">
                <code>{`import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  whileHover={{ scale: 1.1 }}
>
  Content
</motion.div>`}</code>
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Tailwind Animations:</h3>
              <pre className="bg-gray-950 p-3 rounded text-sm overflow-x-auto">
                <code>{`<div className="animate-fade-in">...</div>
<div className="animate-slide-up hover:animate-bounce">...</div>
<div className="animate-float">...</div>`}</code>
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
