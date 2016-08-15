module.exports = {
    options: {
        key:    '<%= settings.aws.accessKeyId %>',
        secret: '<%= settings.aws.secretAccessKey %>',
        access: 'public-read'
    },
    staging: {
        options: {
            bucket: '<%= settings.s3.staging.bucket %>'
        },
        upload: [
            {
                src: [
                    '<%= settings.distDir %>/**',
                    '!<%= settings.distDir %>/index.html'
                ],
                dest: '<%= settings.s3.staging.app %>',
                rel : '<%= settings.distDir %>/',
                options: {
                    CacheControl: 'max-age=31556926'
                }
            },
            {
                src: '<%= settings.distDir %>/index.html',
                dest: '<%= settings.s3.staging.app %><%= _version %>/index.html',
                options: {
                    CacheControl: 'max-age=15'
                }
            },
            {
                src: '<%= settings.distDir %>/index.html',
                dest: '<%= settings.s3.staging.app %>index.html',
                options: {
                    CacheControl: 'max-age=15'
                }
            }
        ]
    },
    production: {
        options: {
            bucket: '<%= settings.s3.production.bucket %>'
        },
        upload: [
            {
                src: ['<%= settings.distDir %>/**','!<%= settings.distDir %>/index.html'],
                dest: '<%= settings.s3.production.app %>',
                rel : '<%= settings.distDir %>/',
                options: {
                    CacheControl: 'max-age=31556926'
                }
            },
            {
                src: '<%= settings.distDir %>/index.html',
                dest: '<%= settings.s3.production.app %><%= _version %>/index.html',
                options: {
                    CacheControl: 'max-age=60'
                }
            },
            {
                src: '<%= settings.distDir %>/index.html',
                dest: '<%= settings.s3.production.app %>index.html',
                options: {
                    CacheControl: 'max-age=60'
                }
            }
        ]
    }
};
