const { default: mongoose } = require("mongoose");

const childSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Child name is required'],
        trim: true,
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
    }
}, { _id: true });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: function() {
            return this.isRegistrationComplete === true;
        },
        trim: true,
        minlength: [3, 'Name must be at least 3 characters'],
        maxlength: [20, 'Name cannot exceed 50 characters']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    location: {
        type: String,
        trim: true,
        required: function() {
            return this.isRegistrationComplete === true;
        },
    },
    children: [childSchema],
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    isRegistrationComplete: {
        type: Boolean,
        default: false, 
    },
    profile: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    lastLogin: {
        type: Date
    },
    deviceInfo: {
        deviceId: String,
        platform: String,
        appVersion: String,
    },
    role:{
        type:String,
        enum:['User'],
        default:'User'
    }

}, {
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});


userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });


childSchema.virtual('age').get(function () {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

userSchema.methods.updateLastLogin = async function () {
    this.lastLogin = new Date();
    await this.save({ validateBeforeSave: false });
};

userSchema.methods.checkRegistrationComplete = function () {
    return !!(this.name && this.phoneNumber && this.email && this.location);
};

userSchema.methods.updateChild = async function (childId, childData) {
    const child = this.children.id(childId);
    if (!child) {
        throw new Error('Child not found');
    }
    Object.assign(child, childData);
    return await this.save();
};


userSchema.methods.removeChild = async function (childId) {
    this.children.pull(childId);
    return await this.save();
};

module.exports = mongoose.model('User', userSchema);