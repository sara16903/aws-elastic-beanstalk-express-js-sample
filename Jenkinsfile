pipeline {
    agent any

    environment {
        IMAGE_NAME = "sara16903/eb-node-sample"
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            agent {
                docker { image 'node:16'; reuseNode true }
            }
            steps {
                sh 'npm install'
            }
        }

        stage('Run Unit Tests') {
            agent {
                docker { image 'node:16'; reuseNode true }
            }
            steps {
                sh 'npm test'
            }
        }

        stage('Dependency Vulnerability Scan') {
            agent {
                docker { image 'node:16'; reuseNode true }
            }
            steps {
                // Save full audit output as JSON for the archive, regardless of outcome,
                // then re-run in normal mode so the High/Critical threshold still fails the build.
                sh 'npm audit --json > npm-audit-report.json || true'
                sh 'npm audit --audit-level=high'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG -t $IMAGE_NAME:latest .'
            }
        }

        stage('Push Image to Registry') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $IMAGE_NAME:$IMAGE_TAG
                        docker push $IMAGE_NAME:latest
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finished: ${currentBuild.currentResult}"
            archiveArtifacts artifacts: 'npm-audit-report.json', allowEmptyArchive: true
        }
        failure {
            echo "Build failed — check the Security Scan stage first if vulnerabilities were the cause."
        }
    }
}
