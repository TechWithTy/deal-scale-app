export const checkForSQLInjection = (value: string): boolean => {
	const sqlInjectionPattern =
		/(\b(SELECT|UPDATE|DELETE|INSERT|DROP|TRUNCATE|ALTER|GRANT|REVOKE)\b|--|;|'|")/i;
	return sqlInjectionPattern.test(value);
};
