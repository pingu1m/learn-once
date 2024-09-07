# Variables
BUCKET_NAME = learn-once.com
WEBSITE_DIR = learn-once

# AWS environment variables (make sure these are exported in your environment)
LEARN_ONCE_S3_ACCESS_KEY ?= $(error LEARN_ONCE_ACCESS_KEY is not set)
LEARN_ONCE_S3_SECRET_KEY ?= $(error LEARN_ONCE_SECRET_KEY is not set)
AWS_REGION = us-east-1 # You can change the region if needed
DISTRIBUTION_ID = E2P2SFFB8NJHXS

.PHONY: deploy deploy-public set-website-config invalidate-cache deploy-and-invalidate clean

# Deploy the website folder to S3
deploy:
	@echo "Deploying $(WEBSITE_DIR) to s3://$(BUCKET_NAME)/"
	AWS_ACCESS_KEY_ID=$(LEARN_ONCE_S3_ACCESS_KEY) AWS_SECRET_ACCESS_KEY=$(LEARN_ONCE_S3_SECRET_KEY) \
	aws s3 sync $(WEBSITE_DIR) s3://$(BUCKET_NAME)/ --region $(AWS_REGION)

# 	aws s3 sync $(WEBSITE_DIR) s3://$(BUCKET_NAME)/ --region $(AWS_REGION) --delete
# Deploy the website with public read permissions (optional)
deploy-public:
	@echo "Deploying $(WEBSITE_DIR) to s3://$(BUCKET_NAME)/ with public read access"
	AWS_ACCESS_KEY_ID=$(LEARN_ONCE_S3_ACCESS_KEY) AWS_SECRET_ACCESS_KEY=$(LEARN_ONCE_S3_SECRET_KEY) \
	aws s3 sync $(WEBSITE_DIR) s3://$(BUCKET_NAME)/ --acl public-read --region $(AWS_REGION) --delete

# Set the bucket as a static website (optional)
set-website-config:
	@echo "Configuring s3://$(BUCKET_NAME) as a static website"
	AWS_ACCESS_KEY_ID=$(LEARN_ONCE_S3_ACCESS_KEY) AWS_SECRET_ACCESS_KEY=$(LEARN_ONCE_S3_SECRET_KEY) \
	aws s3 website s3://$(BUCKET_NAME)/ --index-document index.html --error-document error.html --region $(AWS_REGION)

# Invalidate CloudFront cache
invalidate-cache:
	@echo "Creating CloudFront invalidation for distribution $(DISTRIBUTION_ID)"
	AWS_ACCESS_KEY_ID=$(LEARN_ONCE_S3_ACCESS_KEY) AWS_SECRET_ACCESS_KEY=$(LEARN_ONCE_S3_SECRET_KEY) \
	aws cloudfront create-invalidation --distribution-id $(DISTRIBUTION_ID) --paths "/*" \
	--region $(AWS_REGION)

# Deploy and invalidate CloudFront cache
deploy-and-invalidate: deploy invalidate-cache
	@echo "Deployment and CloudFront cache invalidation complete"

# Clean the S3 bucket
clean:
	@echo "Cleaning all files in s3://$(BUCKET_NAME)/"
	AWS_ACCESS_KEY_ID=$(LEARN_ONCE_S3_ACCESS_KEY) AWS_SECRET_ACCESS_KEY=$(LEARN_ONCE_S3_SECRET_KEY) \
	aws s3 rm s3://$(BUCKET_NAME)/ --recursive --region $(AWS_REGION)
