// Draws every static animated SVG into assets/. Run: node scripts/build.mjs
import { writeFileSync } from 'node:fs'
import { footer, project, stack } from './cards.mjs'
import { hero } from './hero.mjs'
import { pipeline } from './pipeline.mjs'
import { terminal } from './terminal.mjs'

const out = (name, content) => writeFileSync(new URL(`../assets/${name}`, import.meta.url), content)

out('hero.svg', hero())
out('terminal.svg', terminal())
out('voice-loop.svg', pipeline())
out('toolbox.svg', stack())
out('footer.svg', footer())

const projects = [
  {
    file: 'project-heart.svg',
    repo: 'Heart-disease-prediction',
    title: 'Heart Disease Prediction',
    lines: ['A TensorFlow/Keras network against linear SVM', 'and Naive Bayes, after cleaning and EDA.'],
    tags: ['Python', 'TensorFlow', 'scikit-learn'],
    accent: '#f472b6',
    motif: 'ecg',
  },
  {
    file: 'project-ensemble.svg',
    repo: 'Ensemble-learning',
    title: 'Ensemble Learning',
    lines: ['Voting, bagging, boosting and stacking,', 'compared on the Iris dataset.'],
    tags: ['scikit-learn', 'XGBoost'],
    accent: '#a78bfa',
    motif: 'orbit',
  },
  {
    file: 'project-cattle.svg',
    repo: 'cattle-breed-prediction',
    title: 'Cattle Breed Recognition',
    lines: ['A notebook that learns to tell', 'cattle breeds apart.'],
    tags: ['Python', 'Jupyter'],
    accent: '#67e8f9',
    motif: 'scan',
  },
  {
    file: 'project-students.svg',
    repo: 'Edulumus_Internship_Tasks',
    title: 'Student Performance',
    lines: ['EDA and regression models that predict', 'exam scores · Edulumus internship.'],
    tags: ['Pandas', 'scikit-learn'],
    accent: '#fbbf24',
    motif: 'bars',
  },
]
for (const p of projects) out(p.file, project(p))
console.log('built', 5 + projects.length, 'SVGs')
