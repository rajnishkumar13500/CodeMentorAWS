# Use AWS Lambda Node.js public image
FROM public.ecr.aws/lambda/nodejs:18

# Install necessary compilers and runtimes
RUN yum update -y && yum install -y \
    gcc-c++ \
    python3 \
    java-11-amazon-corretto \
    && yum clean all

# Create directory for code execution
RUN mkdir -p /tmp/code

# Copy function code and package.json
COPY index.mjs package.json ${LAMBDA_TASK_ROOT}/

# Install dependencies
RUN npm install

# Set the CMD to your handler
CMD [ "index.handler" ] 