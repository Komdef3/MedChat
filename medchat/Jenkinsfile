pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat'npm install'
            }
        }

        stage('Lint & Format Check') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    bat 'npm run lint'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                bat'npm run build'
            }
        }

        stage('Deploy to Vercel') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    withCredentials([
                        string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN'),
                        string(credentialsId: 'vercel-org-id', variable: 'VERCEL_ORG_ID'),
                        string(credentialsId: 'vercel-project-id', variable: 'VERCEL_PROJECT_ID')
                    ]) {
                        bat 'npx vercel pull --yes --environment=production --token=%VERCEL_TOKEN%'
                        bat 'npx vercel build --prod --token=%VERCEL_TOKEN%'
                        bat 'npx vercel deploy --prebuilt --prod --token=%VERCEL_TOKEN%'
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Frontend Build completed.'
        }
        success {
            echo 'Frontend Pipeline succeeded!'
        }
        failure {
            echo 'Frontend Pipeline failed!'
        }
    }
}