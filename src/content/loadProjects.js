const metaModules = import.meta.glob('./projects/*/meta.json', { eager: true, import: 'default' })
const storyModules = import.meta.glob('./projects/*/story.md', { eager: true, query: '?raw', import: 'default' })
const imageModules = import.meta.glob('./projects/*/images/*', { eager: true, import: 'default' })

const FOLDER_PATTERN = /^\.\/projects\/([^/]+)\/meta\.json$/

export function loadProjects() {
  const projects = Object.entries(metaModules).map(([path, meta]) => {
    const folder = path.match(FOLDER_PATTERN)[1]
    return {
      ...meta,
      storyRaw: storyModules[`./projects/${folder}/story.md`] ?? '',
    }
  })

  return projects.sort((a, b) => a.order - b.order)
}

export function resolveProjectImage(slug, relativePath) {
  if (!relativePath) return undefined
  return imageModules[`./projects/${slug}/${relativePath}`]
}
