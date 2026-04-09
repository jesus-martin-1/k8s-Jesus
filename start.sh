#!/bin/bash
set -e

echo "==> Iniciando clúster con minikube..."
minikube start --driver=docker

echo "==> Construyendo imagen del backend..."
eval $(minikube docker-env)
docker build -t backend-app:latest ./backend

echo "==> Habilitando metrics-server para HPA..."
minikube addons enable metrics-server

echo "==> Aplicando manifiestos de Kubernetes..."
echo "Esperando a que el namespace se sincronice..."
sleep 2 

kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/

echo "==> Esperando a que los pods estén listos..."
kubectl rollout status deployment/postgres -n tasks-app
kubectl rollout status deployment/backend -n tasks-app

echo "==> Estado del clúster:"
kubectl get all -n tasks-app

echo "==> URL de acceso:"
minikube service backend-service -n tasks-app --url