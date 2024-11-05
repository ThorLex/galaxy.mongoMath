import React from 'react';
import { Users, MessageSquare, Github, Twitter } from 'lucide-react';

const Community = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Join Our Community</h1>
        <p className="text-green-300 text-xl">
          Connect with MongoMath developers and users around the world
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <CommunityCard
          icon={<Github className="h-8 w-8" />}
          title="GitHub Discussions"
          description="Join our open source community on GitHub"
          link="https://github.com/ThorLex/galaxy.mongoMath/discussions"
          buttonText="Join Discussions"
        />

        <CommunityCard
          icon={<MessageSquare className="h-8 w-8" />}
          title="Discord Community"
          description="Chat with other developers and get help"
          link="https://discord.gg/mongomath"
          buttonText="Join Discord"
        />

        <CommunityCard
          icon={<Twitter className="h-8 w-8" />}
          title="Twitter"
          description="Follow us for updates and tips"
          link="https://twitter.com/mongomath"
          buttonText="Follow Us"
        />
      </div>

      <div className="mt-16 bg-green-800/30 rounded-xl p-8 border border-green-700">
        <h2 className="text-2xl font-bold text-white mb-6">Community Guidelines</h2>
        <ul className="space-y-4 text-green-300">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Be respectful and inclusive of all community members
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Share knowledge and help others learn
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Report any issues or bugs through GitHub
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Contribute to discussions and documentation
          </li>
        </ul>
      </div>
    </div>
  );
};

interface CommunityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  buttonText: string;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  icon,
  title,
  description,
  link,
  buttonText,
}) => {
  return (
    <div className="bg-green-800/30 rounded-xl p-6 border border-green-700">
      <div className="text-emerald-500 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-green-300 mb-4">{description}</p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        {buttonText}
      </a>
    </div>
  );
};

export default Community;