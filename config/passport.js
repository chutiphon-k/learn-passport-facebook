import { Strategy } from 'passport-facebook'

import { User } from '../app/models/user'
import configAuth from './auth'

let eiei = (passport) => {

	passport.serializeUser((user, done) => {
		done(null, user.id)
	})

	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user)
		})
	})

	passport.use(new Strategy({
		clientID: configAuth.facebookAuth.clientID,
		clientSecret: configAuth.facebookAuth.clientSecret,
		callbackURL: configAuth.facebookAuth.callbackURL
	}, (token, refreshToken, profile, done) => {
		process.nextTick(() => {
			User.findOne({ 'facebook.id': profile.id }, (err, user) => {
				if (err) return done(err)

				if (user) {
					return done(null, user)
				} else {
					let newUser = new User()
					newUser.facebook.id = profile.id
					newUser.facebook.token = token
					newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName
					newUser.facebook.email = profile.emails[0].value

					newUser.save((err) => {
						if (err) throw err

						return done(null, newUser)
					})
				}
			})
		})
	}))
}

export default eiei
