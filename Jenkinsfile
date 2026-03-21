pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                sh '''
                docker build -t bullet-heist .
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker stop bullet-heist || true
                docker rm bullet-heist || true
                docker run -d -p 5000:5000 --name bullet-heist bullet-heist
                '''
            }
        }
    }
}