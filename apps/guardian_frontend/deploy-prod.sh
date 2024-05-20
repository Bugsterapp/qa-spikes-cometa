#!/bin/bash
set -e

# by default only build and deploy APP (api)
DEPLOY_NGINX=0
DEPLOY_APP=1

# reading flags
for i in "$@"; do
  case $i in
    --deploy_app=*)
      DEPLOY_APP="${i#*=}"
      shift # past argument=value
      ;;
    --deploy_nginx=*)
      DEPLOY_NGINX="${i#*=}"
      shift # past argument with no value
      ;;
    -*|--*)
      echo "Unknown option $i"
      exit 1
      ;;
    *)
      ;;
  esac
done


echo -e "\n\033[0;32m====== DEPLOYING COMETA-GUARDIAN-FRONTEND ======"

# if both DEPLOY_APP and DEPLOY_NGINX are false then exit
if [ $DEPLOY_APP -eq 0 ] && [ $DEPLOY_NGINX -eq 0 ];
then
    echo -e "\n\033[0;32mNothing to deploy"
    exit
fi

# container registry login
echo -e "\n\033[0;32mLogin to Elastic Container Registry..."
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 526820460596.dkr.ecr.us-east-1.amazonaws.com



if [ $DEPLOY_NGINX -eq 1 ];
then
    echo -e "\n\033[0;32mBuilding Docker Image for nginx..."
    docker build -t cometa-nginx-next -f deploy/nginx/Dockerfile .

    echo -e "\n\033[0;32mTagging last nginx image..."
    docker tag cometa-nginx-next:latest 526820460596.dkr.ecr.us-east-1.amazonaws.com/cometa-nginx-next:latest

    echo -e "\n\033[0;32mUploading last nginx image to Elastic Container Registry..."
    docker push 526820460596.dkr.ecr.us-east-1.amazonaws.com/cometa-nginx-next:latest
fi

if [ $DEPLOY_APP -eq 1 ];
then
    echo -e "\n\033[0;32mDownloading env file for app..."
    aws s3api get-object --bucket cometa-envs-vars --key portal-prod.env .env.production.local

    echo -e "\n\033[0;32mBuilding Docker Image for app..."
    docker build -t cometa-portal -f deploy/app/Dockerfile .

    echo -e "\n\033[0;32mTagging last image for app..."
    docker tag cometa-portal:latest 526820460596.dkr.ecr.us-east-1.amazonaws.com/cometa-portal:latest

    echo -e "\n\033[0;32mUploading last app image to Elastic Container Registry..."
    docker push 526820460596.dkr.ecr.us-east-1.amazonaws.com/cometa-portal:latest

fi


echo -e "\n\033[0;32mForcing to update ecs fargate cometa-portal service..."
aws ecs update-service --cluster cometa-services --service cometa-portal-services --force-new-deployment --output text --query "service.serviceName"


echo -e "\n\033[0;32m====== DEPLOYED COMETA-GUARDIAN-FRONTEND ======"