import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-gradient">Welcome to New Bizcontently</h1>
          <p className="text-xl">Transform your business content with AI</p>
          <div className="flex gap-4 justify-center mt-8">
            <button className="btn-primary">Get Started</button>
            <button className="btn-outline">Learn More</button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="card">
            <div className="h-12 w-12 rounded-lg gradient-primary mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">✨</span>
            </div>
            <h3 className="mb-2">AI Content Generation</h3>
            <p>
              Create engaging content with the power of artificial intelligence
            </p>
          </div>

          <div className="card">
            <div className="h-12 w-12 rounded-lg bg-brand-secondary mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">🔒</span>
            </div>
            <h3 className="mb-2">Secure Storage</h3>
            <p>Keep your content safe with our secure cloud storage</p>
          </div>

          <div className="card">
            <div className="h-12 w-12 rounded-lg bg-brand-tertiary mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">🚀</span>
            </div>
            <h3 className="mb-2">Real-time Updates</h3>
            <p>Experience instant updates with our real-time database</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center p-8 rounded-2xl gradient-primary text-white">
          <h2 className="text-white mb-4">Ready to Transform Your Content?</h2>
          <p className="text-white/90 mb-8">
            Join thousands of businesses already using our platform
          </p>
          <button className="btn-primary bg-white text-brand-secondary hover:bg-gray-100">
            Start Free Trial
          </button>
        </div>

        {/* Form Example */}
        <div className="max-w-md mx-auto mt-16">
          <h2 className="mb-8">Contact Us</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="input"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="input"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="label">
                Message
              </label>
              <textarea
                id="message"
                className="input min-h-[120px]"
                placeholder="Your message"
              ></textarea>
            </div>
            <button type="submit" className="btn-primary w-full">
              Send Message
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
