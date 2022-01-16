const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const UserData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        // .populate("savedBooks")
        // .populate("bookCount");

        return UserData;
      }

      throw new AuthenticationError("Not logged in");
    },
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("incorrect email or password");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("incorrect email or password");
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, args, context) => {
      if (context.user) {
        const Bookadded = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: args.newBook } },
          { new: true }
        );
        return Bookadded;
      }
      throw new AuthenticationError("Please log in");
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const Bookremoved = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return Bookremoved;
      }
      throw new AuthenticationError("Please log in");
    },
  },
};

module.exports = resolvers;
