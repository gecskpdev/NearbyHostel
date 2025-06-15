'use client';

import { useState, useEffect } from 'react';
import TableSkeleton from '@/components/repeto/TableSkeleton';

interface TeamMember {
  memberId?: number;
  name: string;
  linkedin?: string;
}

interface Project {
  projectId?: number;
  projectName: string;
  projectDescription?: string;
  projectLink?: string;
  createdAt: string;
  members: TeamMember[];
  selectedCategoryOptions: Record<string, string>; // Map category name to selected option name
  customDomain?: string; // Keep customDomain separate if 'Domain' is 'Other'
  categories?: { categoryName: string; optionName: string; customDomain?: string }[];
}

interface CategoryOption {
    optionId: number;
    optionName: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  options: CategoryOption[];
}

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  useEffect(() => {
    // console.time('Initial Data Fetch');
    fetchProjects();
    const fetchCategories = async () => {
      // console.time('fetchCategories');
      const CACHE_KEY = 'cachedCategories';
      const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRATION_TIME) {
          setCategories(data);
          setLoadingCategories(false);
          console.log('Categories loaded from cache.');
          return; // Use cached data and exit
        }
      }

      try {
        const res = await fetch('/api/categories');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: Category[] = await res.json();
        setCategories(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        // console.timeEnd('fetchCategories');
      } catch (e: any) {
        setErrorCategories(e.message);
        console.error("Failed to fetch categories for form:", e);
        // console.timeEnd('fetchCategories');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const fetchProjects = async () => {
    // console.time('fetchProjects');
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: Project[] = await res.json();
      console.log('Fetched Projects Data:', data);
      setProjects(data);
      // console.timeEnd('fetchProjects');
    } catch (e: any) {
      setError(e.message);
      console.error("Failed to fetch projects:", e);
      // console.timeEnd('fetchProjects');
    } finally {
      setLoading(false);
      // console.timeEnd('Initial Data Fetch');
    }
  };

  const handleAddProject = () => {
    setCurrentProject({
      projectName: '',
      projectDescription: '',
      projectLink: '',
      createdAt: new Date().toISOString().split('T')[0],
      members: [{ name: '', linkedin: '' }],
      selectedCategoryOptions: {},
    });
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    console.log('Editing Project:', project);
    const selectedCategoryOptions: Record<string, string> = {};

    // Initialize all categories with existing project values or empty string
    categories.forEach(category => {
      const projectOption = project.categories?.find(
        pco => pco.categoryName.toLowerCase() === category.categoryName.toLowerCase()
      );
      selectedCategoryOptions[category.categoryName] = projectOption?.optionName.trim() || '';
      if (category.categoryName === 'Year of Submission') {
        console.log(`handleEditProject - Year of Submission - projectOption: ${projectOption?.optionName}, trimmed: ${projectOption?.optionName.trim()}, selectedCategoryOptions: ${selectedCategoryOptions[category.categoryName]}`);
      }
    });

    setCurrentProject({
      ...project,
      createdAt: project.createdAt.split('T')[0],
      selectedCategoryOptions,
      customDomain: project.customDomain || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (projectId: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const res = await fetch('/api/projects', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId }),
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        setProjects(projects.filter((p) => p.projectId !== projectId));
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to delete project:", e);
      }
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    const hasValidMember = currentProject.members.some(
      (member) => member.name.trim() !== ""
    );
    if (!hasValidMember) {
      alert("Please enter at least one member name.");
      return;
    }

    const filteredMembers = currentProject.members.filter(
      (member) => member.name.trim() !== ""
    );

    // Prepare category options for backend
    const projectCategoryOptions: { categoryName: string; optionName: string; customDomain?: string }[] = Object.entries(currentProject.selectedCategoryOptions).map(([categoryName, optionName]) => ({
      categoryName,
      optionName: categoryName === 'Domain' && optionName === 'Other' ? (currentProject.customDomain || '') : optionName // Use customDomain if 'Other' domain is selected
    }));

    const projectData = {
      projectId: currentProject.projectId, // Include projectId for PUT requests
      projectName: currentProject.projectName,
      projectDescription: currentProject.projectDescription,
      projectLink: currentProject.projectLink,
      createdAt: currentProject.createdAt,
      members: filteredMembers,
      projectCategoryOptions, // Send as a generic array of category options
      customDomain: currentProject.selectedCategoryOptions['Domain'] === 'Other' ? currentProject.customDomain : undefined, // Send customDomain separately
    };

    const method = currentProject.projectId ? 'PUT' : 'POST';
    const url = '/api/projects';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      fetchProjects(); // Refresh the list
      setIsModalOpen(false);
      setCurrentProject(null);
    } catch (e: any) {
      setError(e.message);
      console.error("Failed to save project:", e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentProject((prev) => {
      if (!prev) return null;
      if (name.startsWith("category-")) {
        const categoryName = name.replace("category-", "");
        return {
          ...prev,
          selectedCategoryOptions: {
            ...prev.selectedCategoryOptions,
            [categoryName]: value.trim(),
          },
          // Clear customDomain if the Domain category is not 'Other'
          customDomain: categoryName === 'Domain' && value !== 'Other' ? '' : prev.customDomain,
        };
      } else if (name === "customDomain") {
        return { ...prev, customDomain: value };
      } else {
        return { ...prev, [name]: value };
      }
    });
    if (name.startsWith("category-") && name.replace("category-", "") === 'Year of Submission') {
      console.log(`handleChange - Year of Submission - name: ${name}, value: ${value}, trimmed: ${value.trim()}`);
    }
  };

  const handleMemberChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentProject((prev) => {
      if (!prev) return null;
      const updatedMembers = [...prev.members];
      updatedMembers[index] = { ...updatedMembers[index], [name]: value };
      return { ...prev, members: updatedMembers };
    });
  };

  const handleAddMember = () => {
    setCurrentProject((prev) => {
      if (!prev) return null;
      return { ...prev, members: [...prev.members, { name: '', linkedin: '' }] };
    });
  };

  const handleRemoveMember = (index: number) => {
    setCurrentProject((prev) => {
      if (!prev) return null;
      const updatedMembers = prev.members.filter((_, i) => i !== index);
      return { ...prev, members: updatedMembers };
    });
  };

  if (loading) return <TableSkeleton />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 p-4 md:p-6">
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Projects</h1>

        <button
          onClick={handleAddProject}
          className="bg-blue-600 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-700 w-full md:w-auto"
        >
          Add New Project
        </button>

        <div className="bg-white shadow-md rounded-lg p-4 md:p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.projectId}>
                  <td className="px-6 py-4 whitespace-nowrap">{project.projectName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{project.projectDescription?.substring(0, 50)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => project.projectId && handleDeleteProject(project.projectId)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && currentProject && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {currentProject.projectId ? 'Edit Project' : 'Add Project'}
              </h2>
              <form onSubmit={handleSaveProject} className="space-y-4">
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">Project Name</label>
                  <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    value={currentProject.projectName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700">Project Description</label>
                  <textarea
                    id="projectDescription"
                    name="projectDescription"
                    value={currentProject.projectDescription}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="projectLink" className="block text-sm font-medium text-gray-700">Project Link</label>
                  <input
                    type="url"
                    id="projectLink"
                    name="projectLink"
                    value={currentProject.projectLink}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700">Created At</label>
                  <input
                    type="date"
                    id="createdAt"
                    name="createdAt"
                    value={currentProject.createdAt}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>

                {/* Dynamic Category Selects */}
                {categories.length > 0 && categories.map(category => (
                  <div key={category.categoryId} className="mb-4">
                    <label htmlFor={`category-${category.categoryName}`} className="block text-sm font-medium text-gray-700">
                      {category.categoryName}
                    </label>
                    <select
                      id={`category-${category.categoryName}`}
                      name={`category-${category.categoryName}`}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                      onChange={handleChange}
                      value={currentProject.selectedCategoryOptions[category.categoryName] || ''}
                    >
                      <option value="">Select a {category.categoryName}</option>
                      {category.options.map((option) => (
                        <option key={option.optionId} value={option.optionName.trim()}>
                          {option.optionName}
                        </option>
                      ))}
                    </select>
                    {category.categoryName === 'Domain' && currentProject.selectedCategoryOptions['Domain'] === 'Other' && (
                      <input
                        type="text"
                        name="customDomain"
                        required
                        className="mt-2 w-full px-4 py-2 border rounded-lg"
                        placeholder="Enter custom domain"
                        onChange={handleChange}
                        value={currentProject.customDomain || ''}
                      />
                    )}
                  </div>
                ))}

                {/* Members */}
                <h3 className="text-lg font-medium text-gray-700 mt-6 mb-2">Team Members</h3>
                {currentProject.members.map((member, index) => (
                  <div key={index} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-2 items-end">
                    <div className="flex-1 w-full">
                      <label htmlFor={`member-name-${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        id={`member-name-${index}`}
                        name="name"
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, e)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label htmlFor={`member-linkedin-${index}`} className="block text-sm font-medium text-gray-700">LinkedIn</label>
                      <input
                        type="url"
                        id={`member-linkedin-${index}`}
                        name="linkedin"
                        value={member.linkedin}
                        onChange={(e) => handleMemberChange(index, e)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="bg-red-500 text-white px-3 py-2 rounded-md h-fit hover:bg-red-600 w-full sm:w-auto"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full sm:w-auto"
                >
                  Add Member
                </button>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 