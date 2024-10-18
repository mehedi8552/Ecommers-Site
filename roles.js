const roles = {
    superadmin: ['viewAllUsers', 'manageUsers', 'viewProfile','viewPosts'],
    admin: ['viewAllUsers', 'managePosts', 'manageProducts', 'viewProfile','viewPosts'],
    user: ['viewPosts','createOrder','readOrder', 'viewProfile']
};

module.exports = roles;


